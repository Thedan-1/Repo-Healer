import React, { useState } from 'react';
import { RepoFile } from '../types';
import { FileCode, Play, RotateCcw, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';

interface CodeEditorPanelProps {
  files: RepoFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onUpdateFileContent: (path: string, newContent: string) => void;
  onRunAgent: () => void;
  isAgentRunning: boolean;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onUpdateFileContent,
  onRunAgent,
  isAgentRunning,
}) => {
  const [copied, setCopied] = useState(false);
  const currentFile = files.find((f) => f.path === activeFilePath) || files[0];

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
      {/* File Tabs Header */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2">
          {files.map((file) => {
            const isActive = file.path === activeFilePath;
            return (
              <button
                key={file.path}
                onClick={() => onSelectFile(file.path)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{file.path}</span>
                {file.hasBug && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all active:scale-97"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? '已复制' : '复制代码'}</span>
          </button>
        </div>
      </div>

      {/* Bug Banner if active file has bug */}
      {currentFile?.hasBug && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>检测到缺陷: {currentFile.bugDescription}</span>
          </div>
          <button
            onClick={onRunAgent}
            disabled={isAgentRunning}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1 rounded-lg text-xs transition-all shadow-2xs active:scale-97"
          >
            触发 Agent 修复 (Fix)
          </button>
        </div>
      )}

      {/* Text Area Code Editor */}
      <div className="flex-1 bg-slate-900 p-4 font-mono text-xs text-blue-200 overflow-y-auto">
        <textarea
          value={currentFile?.content || ''}
          onChange={(e) => onUpdateFileContent(currentFile.path, e.target.value)}
          className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-100 leading-relaxed font-mono selection:bg-blue-800/60"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
