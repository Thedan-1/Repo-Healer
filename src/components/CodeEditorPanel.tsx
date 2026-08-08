import React, { useState } from 'react';
import { RepoFile } from '../types';
import {
  FileCode,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Save,
  FolderTree,
  Upload,
  Sparkles,
  X,
  FileCode2,
  Terminal,
  Code2,
  Maximize2,
  Minimize2,
  MoveVertical
} from 'lucide-react';

interface CodeEditorPanelProps {
  files: RepoFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onUpdateFileContent: (path: string, newContent: string) => void;
  onRunAgent: () => void;
  isAgentRunning: boolean;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onOpenUploadModal: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onUpdateFileContent,
  onRunAgent,
  isAgentRunning,
  onAddFile,
  onDeleteFile,
  onOpenUploadModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [ideHeight, setIdeHeight] = useState<'standard' | 'tall' | 'ultra' | 'full'>('tall');

  const currentFile = files.find((f) => f.path === activeFilePath) || files[0];

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [dismissedBugs, setDismissedBugs] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setSaved(true);
    if (currentFile?.path) {
      setDismissedBugs((prev) => ({ ...prev, [currentFile.path]: true }));
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onAddFile(newFileName.trim());
    setNewFileName('');
    setShowAddInput(false);
  };

  // Calculate line numbers
  const lines = currentFile ? currentFile.content.split('\n') : [''];

  // Height class mapping
  const heightClassMap = {
    standard: 'h-[550px]',
    tall: 'h-[750px]',
    ultra: 'h-[950px]',
    full: 'h-[85vh]',
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col ${heightClassMap[ideHeight]} shadow-sm transition-all duration-200`}
    >
      {/* IDE Top Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-500/20 text-blue-400 rounded-lg">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-wide">Repo-Healer IDE 集成工作台</span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {files.length} 个源码文件
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Height Adjuster */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[10px] font-mono">
            <span className="px-1.5 text-slate-400 flex items-center gap-1">
              <MoveVertical className="w-3 h-3" />
              高度:
            </span>
            <button
              onClick={() => setIdeHeight('standard')}
              className={`px-2 py-0.5 rounded transition-all ${
                ideHeight === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              标准(550)
            </button>
            <button
              onClick={() => setIdeHeight('tall')}
              className={`px-2 py-0.5 rounded transition-all ${
                ideHeight === 'tall' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              大号(750)
            </button>
            <button
              onClick={() => setIdeHeight('ultra')}
              className={`px-2 py-0.5 rounded transition-all ${
                ideHeight === 'ultra' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              超大(950)
            </button>
            <button
              onClick={() => setIdeHeight('full')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-0.5 ${
                ideHeight === 'full' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-2.5 h-2.5" />
              自适应
            </button>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onOpenUploadModal}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 flex items-center gap-1.5 transition-all"
            title="上传/导入本地代码文件"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>导入代码</span>
          </button>

          <button
            onClick={onRunAgent}
            disabled={isAgentRunning}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all active:scale-97 disabled:opacity-50"
          >
            {isAgentRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>自愈中</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>一键 AI 自愈</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left IDE File Explorer Drawer */}
        <div className="w-56 bg-slate-50 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-600" />
              文件资源管理器
            </span>

            <button
              onClick={() => setShowAddInput(!showAddInput)}
              className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              title="新建文件"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New File Inline Input */}
          {showAddInput && (
            <form onSubmit={handleCreateFileSubmit} className="p-2 border-b border-slate-200 bg-white">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. utils.py"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
              <div className="flex justify-end gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddInput(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 px-1.5 py-0.5"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded"
                >
                  创建
                </button>
              </div>
            </form>
          )}

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file) => {
              const isActive = file.path === activeFilePath;
              return (
                <div
                  key={file.path}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                  onClick={() => onSelectFile(file.path)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{file.path}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.path);
                        }}
                        className="p-1 hover:text-rose-600 rounded text-slate-400"
                        title="删除文件"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Editor Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* File Open Tabs Bar */}
          <div className="bg-slate-950 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-1">
              {files.map((file) => {
                const isActive = file.path === activeFilePath;
                return (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile(file.path)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs font-mono cursor-pointer border-t border-x transition-all ${
                      isActive
                        ? 'bg-slate-900 text-blue-300 border-blue-500 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{file.path}</span>
                    {file.hasBug && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition-all"
              >
                {saved ? <Check className="w-3 h-3 text-emerald-400" /> : <Save className="w-3 h-3 text-slate-400" />}
                <span>{saved ? '已保存' : '保存'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
            </div>
          </div>

          {/* Active File Bug Warning Banner */}
          {currentFile?.hasBug && !dismissedBugs[currentFile.path] && (
            <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>发现代码隐患: {currentFile.bugDescription}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRunAgent}
                  disabled={isAgentRunning}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded text-xs transition-all shadow-2xs"
                >
                  生成 Search/Replace 补丁
                </button>
                <button
                  onClick={() =>
                    setDismissedBugs((prev) => ({ ...prev, [currentFile.path]: true }))
                  }
                  className="p-1 text-rose-300 hover:text-white hover:bg-rose-900 rounded"
                  title="关闭隐患提示"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* IDE Text Area with Line Number Gutter */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs text-blue-100">
            {/* Line Numbers Column */}
            <div className="w-10 bg-slate-950 text-slate-600 text-right pr-2 py-4 select-none font-mono text-[11px] leading-relaxed border-r border-slate-800/80 shrink-0">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Code Box */}
            <textarea
              value={currentFile?.content || ''}
              onChange={(e) => onUpdateFileContent(currentFile.path, e.target.value)}
              className="flex-1 bg-slate-900 p-4 resize-none focus:outline-none text-slate-100 leading-relaxed font-mono selection:bg-blue-800/80 overflow-y-auto"
              spellCheck={false}
            />
          </div>

          {/* Bottom IDE Status Bar */}
          <div className="h-7 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span>行数: {lines.length}</span>
              <span>|</span>
              <span>编码: UTF-8</span>
              <span>|</span>
              <span>语言: {currentFile?.language === 'python' ? 'Python 3.11' : 'TypeScript'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                PyTest Runner Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
