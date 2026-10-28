import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export type VerificationStatus = 'passed' | 'failed' | 'timed_out' | 'error' | 'not_run';

export interface VerificationFile {
  path: string;
  content: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  passed: boolean | null;
  totalTests: number;
  failedTests: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  reason?: string;
}

export interface VerificationOptions {
  timeoutMs?: number;
  maxOutputBytes?: number;
  pythonBin?: string;
}

const MAX_FILES = 200;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_TOTAL_BYTES = 5 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_OUTPUT_BYTES = 128 * 1024;

function normalizeRelativePath(input: string): string {
  if (typeof input !== 'string' || input.length === 0 || input.includes('\0')) {
    throw new Error('File paths must be non-empty strings without null bytes.');
  }

  const normalized = path.posix.normalize(input.replaceAll('\\', '/'));
  if (
    normalized === '.' ||
    normalized.startsWith('../') ||
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//.test(normalized)
  ) {
    throw new Error(`Unsafe file path: ${input}`);
  }

  return normalized;
}

function validateFiles(files: VerificationFile[]): VerificationFile[] {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('At least one repository file is required.');
  }
  if (files.length > MAX_FILES) {
    throw new Error(`A maximum of ${MAX_FILES} files can be verified at once.`);
  }

  let totalBytes = 0;
  const seen = new Set<string>();
  return files.map((file) => {
    const normalizedPath = normalizeRelativePath(file.path);
    if (seen.has(normalizedPath)) {
      throw new Error(`Duplicate file path: ${normalizedPath}`);
    }
    seen.add(normalizedPath);

    const content = typeof file.content === 'string' ? file.content : '';
    const size = Buffer.byteLength(content, 'utf8');
    if (size > MAX_FILE_BYTES) {
      throw new Error(`File ${normalizedPath} exceeds the ${MAX_FILE_BYTES} byte limit.`);
    }
    totalBytes += size;
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error(`Repository exceeds the ${MAX_TOTAL_BYTES} byte verification limit.`);
    }
    return { path: normalizedPath, content };
  });
}

function appendOutput(current: string, chunk: Buffer | string, maxBytes: number): string {
  const next = current + chunk.toString();
  if (Buffer.byteLength(next, 'utf8') <= maxBytes) return next;
  return `${next.slice(0, maxBytes)}\n...[output truncated]`;
}

function parsePytestSummary(stdout: string, stderr: string): { totalTests: number; failedTests: number } {
  const output = `${stdout}\n${stderr}`;
  const count = (label: string) => Number(output.match(new RegExp(`(\\d+)\\s+${label}`))?.[1] || 0);
  const passed = count('passed');
  const failed = count('failed');
  const errors = count('error(?:s)?');
  return { totalTests: passed + failed + errors, failedTests: failed + errors };
}

function inferTestPath(files: VerificationFile[]): string | undefined {
  return files.find((file) => /(^|\/)test[^/]*\.py$/i.test(file.path))?.path;
}

/**
 * Run only the fixed pytest command in a temporary directory. No shell is used,
 * user supplied command strings are never evaluated, and all input paths are
 * normalized before they are written.
 */
export async function runPythonVerification(
  inputFiles: VerificationFile[],
  requestedTestPath?: string,
  options: VerificationOptions = {},
): Promise<VerificationResult> {
  let files: VerificationFile[];
  try {
    files = validateFiles(inputFiles);
  } catch (error) {
    return {
      status: 'error',
      passed: false,
      totalTests: 0,
      failedTests: 0,
      stdout: '',
      stderr: '',
      exitCode: null,
      durationMs: 0,
      reason: error instanceof Error ? error.message : 'Invalid verification input.',
    };
  }

  let testPath: string | undefined;
  try {
    testPath = requestedTestPath ? normalizeRelativePath(requestedTestPath) : inferTestPath(files);
  } catch (error) {
    return {
      status: 'error',
      passed: false,
      totalTests: 0,
      failedTests: 0,
      stdout: '',
      stderr: '',
      exitCode: null,
      durationMs: 0,
      reason: error instanceof Error ? error.message : 'Invalid test path.',
    };
  }

  if (!testPath || !files.some((file) => file.path === testPath)) {
    return {
      status: 'not_run',
      passed: null,
      totalTests: 0,
      failedTests: 0,
      stdout: '',
      stderr: '',
      exitCode: null,
      durationMs: 0,
      reason: 'No test file was provided for verification.',
    };
  }

  const timeoutMs = Math.max(1_000, Math.min(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 120_000));
  const maxOutputBytes = Math.max(4_096, Math.min(options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES, 512 * 1024));
  const root = await mkdtemp(path.join(os.tmpdir(), 'repo-healer-'));
  const startedAt = Date.now();
  let stdout = '';
  let stderr = '';

  try {
    await Promise.all(
      files.map(async (file) => {
        const destination = path.join(root, ...file.path.split('/'));
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, file.content, 'utf8');
      }),
    );

    const pythonBin = options.pythonBin || (process.platform === 'win32' ? 'python' : 'python3');
    const result = await new Promise<{ status: VerificationStatus; exitCode: number | null; reason?: string }>((resolve) => {
      const child = spawn(pythonBin, ['-m', 'pytest', '-q', testPath as string], {
        cwd: root,
        shell: false,
        env: {
          PATH: process.env.PATH || process.env.Path || '',
          Path: process.env.Path || process.env.PATH || '',
          PATHEXT: process.env.PATHEXT || '',
          SystemRoot: process.env.SystemRoot || '',
          TEMP: process.env.TEMP || '',
          TMP: process.env.TMP || '',
          PYTHONDONTWRITEBYTECODE: '1',
        },
      });
      let settled = false;
      let timedOut = false;
      let timeoutHandle: NodeJS.Timeout | undefined;
      const finish = (value: { status: VerificationStatus; exitCode: number | null; reason?: string }) => {
        if (!settled) {
          settled = true;
          if (timeoutHandle) clearTimeout(timeoutHandle);
          resolve(value);
        }
      };

      child.stdout.on('data', (chunk: Buffer) => {
        stdout = appendOutput(stdout, chunk, maxOutputBytes);
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = appendOutput(stderr, chunk, maxOutputBytes);
      });
      child.once('error', (error) => {
        finish({ status: 'error', exitCode: null, reason: error.message });
      });
      child.once('close', (code) => {
        if (timedOut) {
          finish({ status: 'timed_out', exitCode: code });
        } else if (code === 0) {
          finish({ status: 'passed', exitCode: code });
        } else {
          finish({ status: 'failed', exitCode: code });
        }
      });

      timeoutHandle = setTimeout(() => {
        if (settled) return;
        timedOut = true;
        child.kill();
        finish({ status: 'timed_out', exitCode: null, reason: `pytest exceeded the ${timeoutMs}ms timeout.` });
      }, timeoutMs);
    });

    const summary = parsePytestSummary(stdout, stderr);
    return {
      status: result.status,
      passed: result.status === 'passed' ? true : result.status === 'not_run' ? null : false,
      totalTests: summary.totalTests,
      failedTests: summary.failedTests,
      stdout,
      stderr,
      exitCode: result.exitCode,
      durationMs: Date.now() - startedAt,
      reason: result.reason,
    };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
