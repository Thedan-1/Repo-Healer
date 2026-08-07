import React, { useState } from 'react';
import { FileDiff } from '../types';
import { FileCode, Columns, AlignJustify, Copy, Check, ArrowRight } from 'lucide-react';

interface CodeDiffViewerProps {
  diffs: FileDiff[];
  activeFilePath?: string;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diffs }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);
  const [selectedDiffIndex, setSelectedDiffIndex] = useState(0);

  if (!diffs || diffs.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
        <FileCode className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">尚无代码差异 (Diff)。点击“触发 Agent 自愈”生成自动化修复补丁。</p>
      </div>
    );
  }

  const currentDiff = diffs[selectedDiffIndex] || diffs[0];
  const origLines = currentDiff.originalCode.split('\n');
  const healedLines = currentDiff.healedCode.split('\n');

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(currentDiff.unifiedDiff || currentDiff.healedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-sm">
      {/* Top Header Bar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">修复补丁 Patch: {currentDiff.path}</span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium ml-2 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-emerald-600">+{currentDiff.additions}</span>
            <span className="text-rose-600">-{currentDiff.deletions}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Side-by-Side vs Unified View Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> 双列对比 (Side-by-Side)
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === 'unified'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" /> 统一 Patch 视图
            </button>
          </div>

          <button
            onClick={handleCopyPatch}
            className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-all shadow-2xs active:scale-97 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Patch 已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制 Patch 补丁</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Diff Code Display */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1 overflow-hidden font-mono text-xs">
          {/* Left Column: Original Code */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-900">
            <div className="bg-rose-950/80 px-3.5 py-2 border-b border-rose-900 text-[11px] font-bold text-rose-300 flex items-center justify-between">
              <span>修复前 BEFORE (缺陷源代码)</span>
              <span className="text-[10px] text-rose-400/80 font-normal">Original Code</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 text-slate-300">
              {origLines.map((line, idx) => {
                const isDifferent = healedLines[idx] !== line;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-2 py-0.5 rounded leading-relaxed ${
                      isDifferent ? 'bg-rose-950/60 text-rose-300 border-l-2 border-rose-500' : ''
                    }`}
                  >
                    <span className="w-6 text-right text-slate-600 select-none text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre overflow-x-auto">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Healed Code */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-900">
            <div className="bg-emerald-950/80 px-3.5 py-2 border-b border-emerald-900 text-[11px] font-bold text-emerald-300 flex items-center justify-between">
              <span>修复后 AFTER (Agent 自愈 Patch)</span>
              <span className="text-[10px] text-emerald-400/80 font-normal">AST Verified</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 text-slate-300">
              {healedLines.map((line, idx) => {
                const isDifferent = origLines[idx] !== line;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-2 py-0.5 rounded leading-relaxed ${
                      isDifferent ? 'bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <span className="w-6 text-right text-slate-600 select-none text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre overflow-x-auto">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Unified Patch Mode */
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900 font-mono text-xs text-slate-200">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {currentDiff.unifiedDiff.split('\n').map((line, idx) => {
              let lineStyle = 'text-slate-400';
              if (line.startsWith('+')) lineStyle = 'text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded my-0.5 block';
              if (line.startsWith('-')) lineStyle = 'text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded my-0.5 block';
              if (line.startsWith('@@')) lineStyle = 'text-blue-400 font-bold';
              return (
                <div key={idx} className={lineStyle}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
};
