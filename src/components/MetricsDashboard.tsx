import React from 'react';
import { MetricData } from '../types';
import { DollarSign, Clock, RefreshCw, CheckCircle2, XCircle, Cpu, Database } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: MetricData;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const isPassed = metrics.testStatus === 'passed';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* KPI 1: Token Cost */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">Token 消耗总计</span>
          <DollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-slate-900">
            ${metrics.estimatedCostUSD.toFixed(6)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.totalTokens.toLocaleString()} tokens
          </div>
        </div>
      </div>

      {/* KPI 2: Step Latency */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">平均延迟 (Latency)</span>
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {(metrics.totalLatencyMs / 1000).toFixed(2)}s
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.totalLatencyMs}ms 执行时间
          </div>
        </div>
      </div>

      {/* KPI 3: Healing Loops */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">修复循环 (Loops)</span>
          <RefreshCw className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {metrics.healingLoopsCount}/{metrics.maxHealingLoops}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            已使用重试次数
          </div>
        </div>
      </div>

      {/* KPI 4: Test Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ring-2 ring-emerald-500/20">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">测试状态 (Status)</span>
          {isPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 animate-pulse" />
          )}
        </div>
        <div>
          <div
            className={`text-base font-bold font-mono uppercase tracking-tight ${
              isPassed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPassed ? 'PASSED 通过' : 'RUNNING 运行中'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            PyTest 套件结果
          </div>
        </div>
      </div>

      {/* KPI 5: AST Nodes */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">AST 抽象语法节点</span>
          <Cpu className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {metrics.astNodesParsed}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            已解析符号节点
          </div>
        </div>
      </div>

      {/* KPI 6: Vector Database Index */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold text-slate-600">ChromaDB 向量</span>
          <Database className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {metrics.chromaEmbeddingsCount}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            本地 Embeddings 嵌入
          </div>
        </div>
      </div>
    </div>
  );
};
