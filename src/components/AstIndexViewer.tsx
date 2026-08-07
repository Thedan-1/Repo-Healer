import React, { useState } from 'react';
import { ASTNodeInfo } from '../types';
import {
  Cpu,
  Database,
  Search,
  Code2,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Zap,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Bug,
  KeyRound,
  FileCode2,
  Terminal
} from 'lucide-react';

interface AstIndexViewerProps {
  astNodes: ASTNodeInfo[];
  repoName: string;
}

interface VulnerabilityItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  astNodeType: string;
  symbolName: string;
  line: number;
  description: string;
  recommendation: string;
  fixedCode: string;
  fixed: boolean;
}

export const AstIndexViewer: React.FC<AstIndexViewerProps> = ({ astNodes, repoName }) => {
  const [activeSubTab, setActiveSubTab] = useState<'symbols' | 'callgraph' | 'security' | 'playground'>('symbols');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'class' | 'function' | 'import'>('all');
  
  // Custom Playground Code
  const [customCode, setCustomCode] = useState<string>(`def process_user_data(user_id, raw_amount):\n    # TODO: Calculate average score without zero check\n    count = 0\n    total = raw_amount\n    \n    # Vulnerability 1: Division by zero risk\n    average = total / count\n    \n    # Vulnerability 2: Hardcoded Secret Key\n    API_SECRET = "sk_live_98127391823791283"\n    \n    return average\n`);
  const [parsedCustomNodes, setParsedCustomNodes] = useState<ASTNodeInfo[]>([]);
  const [isParsingCustom, setIsParsingCustom] = useState(false);

  // Security Vulnerabilities State
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[]>([
    {
      id: 'vuln-1',
      severity: 'high',
      title: '未处理的 ZeroDivisionError (除零算术潜在崩溃)',
      astNodeType: 'BinOp (Div)',
      symbolName: 'calculate_discount',
      line: 42,
      description: '在 BinOp(op=Div()) 抽象语法树节点中，除数表达式 `item_count` 未经大于 0 机制断言保护，当集合为空时触发运行时零除崩溃。',
      recommendation: '引入 AST 条件卫语句：`if item_count <= 0: return 0.0`',
      fixedCode: 'if item_count <= 0:\n    return 0.0\nreturn total / item_count',
      fixed: false,
    },
    {
      id: 'vuln-2',
      severity: 'critical',
      title: '硬编码 API Secret 凭据泄露风险',
      astNodeType: 'Assign (Constant)',
      symbolName: 'JWT_SECRET_KEY',
      line: 18,
      description: 'AST Assign 节点定义了硬编码明文密钥字符串 `"sk_live_prod_9918237123"`，易在版本库中泄露风险。',
      recommendation: '重构为 process.env 读取：`os.getenv("JWT_SECRET_KEY")`',
      fixedCode: 'JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")',
      fixed: false,
    },
    {
      id: 'vuln-3',
      severity: 'medium',
      title: '未使用的死代码与无效 Import 导包',
      astNodeType: 'Import (unused)',
      symbolName: 'import os, sys, math',
      line: 3,
      description: '语法树包含未在后文中被引用的冗余包 `math`，增加包依赖耦合与构建负担。',
      recommendation: '从 AST 模块导出声明中移除 `math` 引用。',
      fixedCode: 'import os\nimport sys',
      fixed: false,
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNodes = astNodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.codeSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFixVulnerability = (id: string) => {
    setVulnerabilities((prev) =>
      prev.map((v) => (v.id === id ? { ...v, fixed: true } : v))
    );
  };

  const handleParseCustomCode = () => {
    setIsParsingCustom(true);
    setTimeout(() => {
      const generatedNodes: ASTNodeInfo[] = [
        {
          type: 'function',
          name: 'process_user_data',
          lineStart: 1,
          lineEnd: 11,
          docstring: '处理用户数据并计算平均积分',
          codeSnippet: customCode,
          embeddingVectorPreview: [0.092, -0.141, 0.882, 0.312, -0.051],
        },
        {
          type: 'class',
          name: 'UserDataHandler',
          lineStart: 12,
          lineEnd: 25,
          docstring: 'AST 自定义解析类结构',
          codeSnippet: 'class UserDataHandler:\n    def __init__(self):\n        self.version = "1.0.0"',
          embeddingVectorPreview: [0.311, 0.002, -0.412, 0.912, 0.114],
        },
      ];
      setParsedCustomNodes(generatedNodes);
      setIsParsingCustom(false);
    }, 600);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">
              系统级 AST 抽象语法树解析 & 静态安全巡检引擎
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Chroma 1536-Dim RAG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            实时抽取仓库 <strong className="text-slate-800">{repoName}</strong> 的符号图谱、函数调用链路、圈复杂度与语法树漏洞防护
          </p>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('symbols')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'symbols'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>符号索引库</span>
          </button>

          <button
            onClick={() => setActiveSubTab('callgraph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'callgraph'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-blue-600" />
            <span>调用依赖图谱</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
              activeSubTab === 'security'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>AST 安全巡检</span>
            {vulnerabilities.filter((v) => !v.fixed).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {vulnerabilities.filter((v) => !v.fixed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'playground'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-600" />
            <span>AST 代码沙盒</span>
          </button>
        </div>
      </div>

      {/* Sub Tab 1: AST Symbols Index */}
      {activeSubTab === 'symbols' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">语法树符号总数:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                {astNodes.length} 个 Node
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索类名、函数名或代码关键字..."
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 shadow-2xs"
                />
              </div>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              >
                <option value="all">所有节点类型</option>
                <option value="class">类 (Class)</option>
                <option value="function">函数 (Function)</option>
                <option value="import">导包 (Import)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredNodes.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                未搜索到匹配的 AST 节点。
              </div>
            ) : (
              filteredNodes.map((node, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 hover:border-blue-300 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${
                          node.type === 'class'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : node.type === 'function'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {node.type}
                      </span>
                      <span className="font-bold text-slate-800 text-xs font-mono truncate max-w-[180px]">
                        {node.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      L{node.lineStart}-L{node.lineEnd}
                    </span>
                  </div>

                  <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-blue-200 font-mono overflow-x-auto">
                    {node.codeSnippet}
                  </pre>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-purple-600" /> Chroma Vector (1536 dim)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">余弦距离: 0.941</span>
                    </div>
                    <div className="text-purple-700 font-mono text-[10px] truncate bg-purple-50/50 p-1 rounded border border-purple-100">
                      [{node.embeddingVectorPreview.join(', ')}]
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Call Graph & Dependency Tree */}
      {activeSubTab === 'callgraph' && (
        <div className="space-y-5">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-blue-600" />
              <span><strong>AST 函数级调用图谱：</strong>清晰追踪入参依赖、方法调用链与圈复杂度（Cyclomatic Complexity）。</span>
            </div>
            <span className="font-mono font-bold text-blue-700">解析深度: 4 层</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                caller: 'calculate_refund()',
                file: 'services/payment.py:42',
                complexity: 3,
                calls: ['get_order_details()', 'apply_discount_logic()', 'gateway.post_refund()'],
                sideEffects: '修改数据库订单状态，向第三方 API 发起 HTTPS POST',
                risk: 'Low',
              },
              {
                caller: 'apply_discount_logic()',
                file: 'core/discount.py:15',
                complexity: 7,
                calls: ['validate_coupon_code()', 'compute_ratio()'],
                sideEffects: '纯计算无副作用，可能产生 ZeroDivisionError 挂起',
                risk: 'High',
              },
              {
                caller: 'process_batch_payout()',
                file: 'tasks/worker.py:108',
                complexity: 5,
                calls: ['calculate_refund()', 'log_audit_event()'],
                sideEffects: '后台 Task 队列异步调度',
                risk: 'Medium',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs font-mono">{item.caller}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{item.file}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.risk === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : item.risk === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    风险: {item.risk}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-600 font-medium text-[11px] flex items-center justify-between">
                    <span>圈复杂度 (Cyclomatic):</span>
                    <span className="font-mono font-bold text-slate-800">{item.complexity}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">下游被调函数 (Callees):</span>
                    <div className="space-y-1">
                      {item.calls.map((callee, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 bg-white px-2 py-1 rounded border border-slate-200"
                        >
                          <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{callee}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
                    <strong className="text-slate-700">Side Effects:</strong> {item.sideEffects}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: AST Static Security Audit */}
      {activeSubTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                AST 代码安全与健壮性巡检结果
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                实时扫描 AST 结构中的边界条件缺陷、异常处理漏洞与密钥泄露问题
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              已检测漏洞: {vulnerabilities.filter((v) => !v.fixed).length} 个待修补
            </span>
          </div>

          <div className="space-y-3">
            {vulnerabilities.map((vuln) => (
              <div
                key={vuln.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  vuln.fixed
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : vuln.severity === 'critical'
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        vuln.fixed
                          ? 'bg-emerald-100 text-emerald-800'
                          : vuln.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {vuln.fixed ? '已修补' : vuln.severity}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{vuln.title}</h4>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    节点: <strong className="text-slate-800">{vuln.astNodeType}</strong> (L{vuln.line})
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{vuln.description}</p>

                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 推荐修补规则：
                    </span>
                    {!vuln.fixed && (
                      <button
                        onClick={() => handleFixVulnerability(vuln.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3" />
                        一键 AI 规则修补
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 font-mono text-[11px]">{vuln.recommendation}</p>

                  <pre className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-md overflow-x-auto">
                    {vuln.fixedCode}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 4: Live AST Playground */}
      {activeSubTab === 'playground' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-600" />
                实时 AST 代码解析沙盒 (Playground)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                在下方粘贴或修改任意代码，点击实时提取抽象语法树并生成 1536 维向量
              </p>
            </div>

            <button
              onClick={handleParseCustomCode}
              disabled={isParsingCustom}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isParsingCustom ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  解析 AST 语法树并评估安全
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>源码输入 (Python / TS)</span>
                <span className="text-[10px] text-slate-400 font-mono">Realtime AST Input</span>
              </label>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={12}
                className="w-full bg-slate-900 text-blue-100 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed resize-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>生成 AST 符号表与向量</span>
                <span className="text-[10px] text-slate-400 font-mono">Parsed AST Nodes</span>
              </label>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 max-h-[300px] overflow-y-auto space-y-3">
                {parsedCustomNodes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    点击右上角“解析 AST 语法树”按钮生成结构。
                  </div>
                ) : (
                  parsedCustomNodes.map((node, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-slate-800">{node.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 font-bold border border-purple-200 uppercase">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{node.docstring}</p>
                      <div className="text-[10px] font-mono text-purple-600 bg-purple-50 p-1.5 rounded border border-purple-100 truncate">
                        Embeddings: [{node.embeddingVectorPreview.join(', ')}]
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
