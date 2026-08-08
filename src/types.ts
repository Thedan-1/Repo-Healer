export type AgentMode = 'safe' | 'aggressive' | 'deep-fix';

export interface RepoFile {
  path: string;
  language: 'python' | 'typescript' | 'javascript';
  content: string;
  hasBug?: boolean;
  bugDescription?: string;
  testFile?: string;
  testContent?: string;
}

export interface SampleRepo {
  id: string;
  name: string;
  description: string;
  language: string;
  files: RepoFile[];
}

export type TraceStepStatus = 'pending' | 'running' | 'success' | 'failed' | 'warning';

export interface TraceStep {
  id: string;
  stepNumber: number;
  title: string;
  status: TraceStepStatus;
  timestamp: string;
  durationMs?: number;
  phase: 'index' | 'ast' | 'plan' | 'patch' | 'test' | 'heal' | 'commit';
  thought: string;
  details?: string;
  codeSnippet?: string;
  diffSummary?: {
    additions: number;
    deletions: number;
    file: string;
  };
}

export interface TestResult {
  passed: boolean;
  totalTests: number;
  failedTests: number;
  stdout: string;
  stderr: string;
  traceback?: string;
}

export interface MetricData {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUSD: number;
  totalLatencyMs: number;
  healingLoopsCount: number;
  maxHealingLoops: number;
  testStatus: 'passed' | 'failed' | 'running' | 'idle';
  astNodesParsed: number;
  chromaEmbeddingsCount: number;
}

export interface FileDiff {
  path: string;
  originalCode: string;
  healedCode: string;
  unifiedDiff: string;
  additions: number;
  deletions: number;
}

export interface AgentRunState {
  isIndexing: boolean;
  indexProgress: number;
  isAgentRunning: boolean;
  currentLoop: number;
  maxLoops: number;
  activeStepId: string | null;
  steps: TraceStep[];
  testResult: TestResult | null;
  diffs: FileDiff[];
  metrics: MetricData;
}

export interface CommitHistoryItem {
  hash: string;
  author: string;
  branch: string;
  date: string;
  message: string;
  filesChanged: string[];
  description: string;
}

export interface ASTNodeInfo {
  type: 'class' | 'function' | 'method' | 'import';
  name: string;
  lineStart: number;
  lineEnd: number;
  docstring?: string;
  codeSnippet: string;
  embeddingVectorPreview: number[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface SystemSettings {
  modelProvider: 'google' | 'openai' | 'ollama' | 'custom';
  modelName: string;
  temperature: number;
  maxHealingLoops: number;
  autoCommit: boolean;
  vscodePluginMode: boolean;
  pytestFlags: string;
  customBaseUrl?: string;
  customApiKey?: string;
  customModelName?: string;
}
