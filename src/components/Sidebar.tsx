import React from 'react';
import { AgentMode, SampleRepo } from '../types';
import { FolderGit2, Shield, Zap, Flame, Key, Database, RefreshCw, CheckCircle2, ChevronRight, FileCode2 } from 'lucide-react';

interface SidebarProps {
  sampleRepos: SampleRepo[];
  selectedRepo: SampleRepo;
  onSelectRepo: (repo: SampleRepo) => void;
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  repoPath: string;
  setRepoPath: (path: string) => void;
  onIndexRepo: () => void;
  isIndexing: boolean;
  indexProgress: number;
  hasApiKey: boolean;
  astNodesCount: number;
  chromaCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sampleRepos,
  selectedRepo,
  onSelectRepo,
  agentMode,
  setAgentMode,
  repoPath,
  setRepoPath,
  onIndexRepo,
  isIndexing,
  indexProgress,
  hasApiKey,
  astNodesCount,
  chromaCount,
}) => {
  return (
    <aside className="w-full lg:w-72 bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-5 text-slate-700 shadow-sm">
      {/* Sample Repository Switcher */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
            目标代码仓库 (Repositories)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Python/PyTest</span>
        </label>
        <div className="space-y-2 mt-2">
          {sampleRepos.map((repo) => {
            const isSelected = selectedRepo.id === repo.id;
            return (
              <button
                key={repo.id}
                onClick={() => onSelectRepo(repo)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-[12px]">
                    <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                    {repo.name}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {repo.description}
                  </p>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Repository Path Input */}
      <div className="space-y-1.5">
        <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold">
          仓库路径 (Repository Path)
        </label>
        <div className="relative">
          <input
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="/home/dev/workspace/repo"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Agent Execution Mode */}
      <div className="space-y-2">
        <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold">
          策略模式 (Policy Mode)
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setAgentMode('safe')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-medium transition-all ${
              agentMode === 'safe'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
            <span>安全 (Safe)</span>
          </button>

          <button
            onClick={() => setAgentMode('aggressive')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-medium transition-all ${
              agentMode === 'aggressive'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 mb-0.5 text-blue-600" />
            <span>激进 (Aggressive)</span>
          </button>

          <button
            onClick={() => setAgentMode('deep-fix')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-medium transition-all ${
              agentMode === 'deep-fix'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
            <span>深度 (Deep)</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {agentMode === 'safe' && '保守的 Search/Replace 替换补丁，附带严格 AST 验证。'}
          {agentMode === 'aggressive' && '重构存在 Bug 的函数块，优化代码性能。'}
          {agentMode === 'deep-fix' && '追踪跨文件 import 依赖，修复边缘异常。'}
        </p>
      </div>

      {/* AST Indexer & Vector DB Action */}
      <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            本地 AST 语法索引
          </span>
          <span className="text-[11px] font-mono font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ChromaDB
          </span>
        </div>

        {isIndexing ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>解析 AST 符号节点...</span>
              <span>{indexProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${indexProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={onIndexRepo}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新解析 AST 符号树
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-200">
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] text-slate-400">AST 节点数</div>
            <div className="text-slate-900 font-bold mt-0.5">{astNodesCount} 个 Nodes</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] text-slate-400">向量维度</div>
            <div className="text-slate-900 font-bold mt-0.5">{chromaCount} 维 Vectors</div>
          </div>
        </div>
      </div>

      {/* API Key Status Panel */}
      <div className="mt-auto bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Key className="w-4 h-4 text-blue-600" />
          <div>
            <div className="font-bold text-slate-800 text-[11px] font-mono">Gemini 3.6 API</div>
            <div className="text-[10px] text-slate-500">
              {hasApiKey ? '密钥已配置绑定' : '使用降级本地引擎'}
            </div>
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            hasApiKey ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400 ring-2 ring-amber-200'
          }`}
        />
      </div>
    </aside>
  );
};
