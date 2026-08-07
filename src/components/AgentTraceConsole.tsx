import React, { useState } from 'react';
import { TraceStep } from '../types';
import { Terminal, CheckCircle2, XCircle, Loader2, Sparkles, AlertTriangle, Code2, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface AgentTraceConsoleProps {
  steps: TraceStep[];
  isAgentRunning: boolean;
  currentLoop: number;
  maxLoops: number;
  testOutput?: string;
}

export const AgentTraceConsole: React.FC<AgentTraceConsoleProps> = ({
  steps,
  isAgentRunning,
  currentLoop,
  maxLoops,
  testOutput,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const handleCopyLogs = () => {
    const textLogs = steps
      .map(
        (s) =>
          `[${s.timestamp}] [${s.phase.toUpperCase()}] ${s.title}: ${s.thought}${
            s.details ? '\n' + s.details : ''
          }`
      )
      .join('\n\n');

    navigator.clipboard.writeText(textLogs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
      {/* Console Top Bar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            Agent 实时执行日志 (Live Trace)
          </span>
          <span className="text-[11px] font-mono text-slate-400">[PID: 8219]</span>
          {isAgentRunning && (
            <span className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> 修复循环 Loop {currentLoop}/{maxLoops}
            </span>
          )}
        </div>

        <button
          onClick={handleCopyLogs}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all active:scale-97"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">已复制到剪贴板</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>复制日志 (Copy Logs)</span>
            </>
          )}
        </button>
      </div>

      {/* Console Body Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {steps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Sparkles className="w-8 h-8 text-blue-500/40 animate-bounce" />
            <p className="text-xs text-slate-500 font-medium">Agent 处于待命状态。点击“触发 Agent 自愈”开始自动诊断与代码修复。</p>
          </div>
        ) : (
          steps.map((step) => {
            const isExpanded = expandedStepId === step.id;
            return (
              <div
                key={step.id}
                className="bg-white border border-slate-200/80 rounded-xl overflow-hidden transition-all shadow-2xs hover:shadow-xs"
              >
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="p-3.5 cursor-pointer flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    {step.status === 'running' && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
                    )}
                    {step.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {step.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    {step.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 text-xs font-mono">[{step.timestamp}]</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {step.phase}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">{step.title}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-xs">{step.thought}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.diffSummary && (
                      <div className="text-[11px] font-mono flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        <span className="text-emerald-600 font-semibold">+{step.diffSummary.additions}</span>
                        <span className="text-rose-600 font-semibold">-{step.diffSummary.deletions}</span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (step.details || step.codeSnippet) && (
                  <div className="border-t border-slate-200/80 bg-slate-50/80 p-3.5 space-y-2 text-xs text-slate-700">
                    {step.details && <p className="text-slate-600 leading-relaxed">{step.details}</p>}
                    {step.codeSnippet && (
                      <pre className="bg-slate-900 p-3 rounded-lg text-blue-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
                        {step.codeSnippet}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pytest Sandbox Output Box */}
        {testOutput && (
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-400">
            <div className="text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              PyTest 子进程标准输出 (Stdout / Traceback):
            </div>
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-[11px]">
              {testOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
