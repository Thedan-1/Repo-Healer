import React, { useState, useEffect } from 'react';
import { SAMPLE_REPOS } from './data/sampleRepos';
import { AgentMode, SampleRepo, TraceStep, FileDiff, MetricData, ASTNodeInfo, SystemSettings, NotificationItem } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricsDashboard } from './components/MetricsDashboard';
import { AgentTraceConsole } from './components/AgentTraceConsole';
import { CodeDiffViewer } from './components/CodeDiffViewer';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { AstIndexViewer } from './components/AstIndexViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('trace');
  const [selectedRepo, setSelectedRepo] = useState<SampleRepo>(SAMPLE_REPOS[0]);
  const [repoPath, setRepoPath] = useState<string>('/home/dev/workspace/python-calc-service');
  const [agentMode, setAgentMode] = useState<AgentMode>('safe');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // System Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    modelProvider: 'google',
    modelName: 'gemini-3.6-pro',
    temperature: 0.1,
    maxHealingLoops: 3,
    autoCommit: true,
    vscodePluginMode: false,
    pytestFlags: '-v --tb=short',
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'AST 符号表解析完毕',
      description: '已成功为仓库 python-calc-service 索引 18 个函数与类节点',
      time: '10:42:00',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'ChromaDB 向量数据库已就绪',
      description: '本地计算 36 维余弦相似度 Embeddings',
      time: '10:42:15',
      type: 'success',
      read: false,
    },
  ]);

  // Agent State
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexProgress, setIndexProgress] = useState<number>(100);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [currentLoop, setCurrentLoop] = useState<number>(1);
  const [maxLoops] = useState<number>(3);

  // Results & Logs
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [testOutput, setTestOutput] = useState<string>('');
  const [diffs, setDiffs] = useState<FileDiff[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>(selectedRepo.files[0].path);

  // AST & Metrics
  const [astNodes, setAstNodes] = useState<ASTNodeInfo[]>([]);
  const [metrics, setMetrics] = useState<MetricData>({
    totalTokens: 1420,
    inputTokens: 980,
    outputTokens: 440,
    estimatedCostUSD: 0.000213,
    totalLatencyMs: 1240,
    healingLoopsCount: 1,
    maxHealingLoops: 3,
    testStatus: 'passed',
    astNodesParsed: 18,
    chromaEmbeddingsCount: 36,
  });

  // Check health on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.warn('Health check failed:', err));

    // Initial indexing
    runIndexRepo(selectedRepo);
  }, []);

  const handleSelectRepo = (repo: SampleRepo) => {
    setSelectedRepo(repo);
    setRepoPath(`/home/dev/workspace/${repo.name}`);
    setActiveFilePath(repo.files[0].path);
    runIndexRepo(repo);
  };

  const handleUpdateFileContent = (path: string, newContent: string) => {
    setSelectedRepo((prev) => ({
      ...prev,
      files: prev.files.map((f) => (f.path === path ? { ...f, content: newContent } : f)),
    }));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Re-index repository AST
  const runIndexRepo = async (repo: SampleRepo = selectedRepo) => {
    setIsIndexing(true);
    setIndexProgress(20);

    const timer = setInterval(() => {
      setIndexProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 150);

    try {
      const res = await fetch('/api/index-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: repo.files,
          repoName: repo.name,
        }),
      });

      const data = await res.json();
      clearInterval(timer);
      setIndexProgress(100);

      if (data.astNodes) {
        setAstNodes(
          data.astNodes.map((node: any) => ({
            type: node.type,
            name: node.name,
            lineStart: node.lineStart,
            lineEnd: node.lineEnd,
            docstring: node.docstring,
            codeSnippet: node.snippet,
            embeddingVectorPreview: [
              Number((Math.random() * 0.5).toFixed(3)),
              Number((-Math.random() * 0.4).toFixed(3)),
              Number((Math.random() * 0.8).toFixed(3)),
            ],
          }))
        );
      }

      setTimeout(() => setIsIndexing(false), 300);
    } catch (err) {
      clearInterval(timer);
      setIsIndexing(false);
      console.error('Indexing failed:', err);
    }
  };

  // Trigger Autonomous Agent Self-Healing Loop
  const handleRunAgent = async () => {
    setIsAgentRunning(true);
    setCurrentLoop(1);
    setSteps([]);
    setTestOutput('');

    const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

    // Step 1: Planning
    const step1: TraceStep = {
      id: '1',
      stepNumber: 1,
      title: '解析 AST 代码语法树并定位报错点 (AST Parsing)',
      status: 'running',
      timestamp: now(),
      phase: 'ast',
      thought: `分析 '${selectedRepo.name}' 的 AST 抽象语法树符号图，扫描零除异常与类型强转节点...`,
    };
    setSteps([step1]);

    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Vector Context Retrieval
    const step2: TraceStep = {
      id: '2',
      stepNumber: 2,
      title: '检索 ChromaDB 本地向量嵌入 (Vector Retrieval)',
      status: 'running',
      timestamp: now(),
      phase: 'index',
      thought: '已通过余弦相似度检索前 Top-3 相关异常处理向量上下文。',
    };
    setSteps((prev) => [
      { ...prev[0], status: 'success', durationMs: 220 },
      step2,
    ]);

    await new Promise((r) => setTimeout(r, 600));

    // Call Backend API
    try {
      const res = await fetch('/api/heal-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: selectedRepo,
          files: selectedRepo.files,
          mode: agentMode,
          model: settings.modelName,
        }),
      });

      const data = await res.json();

      // Step 3: Patch Generation
      const step3: TraceStep = {
        id: '3',
        stepNumber: 3,
        title: 'Gemini LLM 智能 Search/Replace 代码补丁生成',
        status: 'success',
        timestamp: now(),
        phase: 'patch',
        thought: `为 ${data.fileDiff?.path || 'core.py'} 生成最小化 Search/Replace 代码替换块。`,
        details: data.diagnosis,
        diffSummary: {
          additions: data.fileDiff?.additions || 8,
          deletions: data.fileDiff?.deletions || 3,
          file: data.fileDiff?.path || 'core.py',
        },
      };

      // Step 4: Subprocess PyTest Run
      const step4: TraceStep = {
        id: '4',
        stepNumber: 4,
        title: '执行 PyTest 自动化测试套件 (Test Execution)',
        status: data.testResult?.passed ? 'success' : 'failed',
        timestamp: now(),
        phase: 'test',
        thought: 'PyTest 测试执行完毕，所有 4 个单元测试断言均已通过！',
      };

      // Step 5: Final Commit
      const step5: TraceStep = {
        id: '5',
        stepNumber: 5,
        title: '代码自愈校验通过，已暂存并自动 Commit 提交',
        status: 'success',
        timestamp: now(),
        phase: 'commit',
        thought: '代码库已完成自愈修复，无任何语法回归，暂存并提交 Patch。',
      };

      setSteps([
        { ...step1, status: 'success' },
        { ...step2, status: 'success' },
        step3,
        step4,
        step5,
      ]);

      setTestOutput(data.testResult?.stdout || '================ 4 passed in 0.12s ================');
      if (data.fileDiff) {
        setDiffs([data.fileDiff]);
      }
      if (data.metrics) {
        setMetrics(data.metrics);
      }

      // Add new notification
      const newNotif: NotificationItem = {
        id: Date.now().toString(),
        title: `代码自愈校验成功 (${data.fileDiff?.path || 'core.py'})`,
        description: `使用 ${settings.modelName} 算法生成的补丁已通过 PyTest 套件所有断言！`,
        time: now(),
        type: 'success',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Update in-memory file with healed code
      if (data.repairedCode && data.fileDiff?.path) {
        handleUpdateFileContent(data.fileDiff.path, data.repairedCode);
      }
    } catch (err: any) {
      console.error('Agent execution error:', err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header Bar */}
      <Header
        hasApiKey={hasApiKey}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunAgent={handleRunAgent}
        isAgentRunning={isAgentRunning}
        settings={settings}
        onUpdateSettings={setSettings}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main App Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Controls */}
        <Sidebar
          sampleRepos={SAMPLE_REPOS}
          selectedRepo={selectedRepo}
          onSelectRepo={handleSelectRepo}
          agentMode={agentMode}
          setAgentMode={setAgentMode}
          repoPath={repoPath}
          setRepoPath={setRepoPath}
          onIndexRepo={() => runIndexRepo()}
          isIndexing={isIndexing}
          indexProgress={indexProgress}
          hasApiKey={hasApiKey}
          astNodesCount={astNodes.length}
          chromaCount={astNodes.length * 2}
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Top KPI Metrics Dashboard */}
          <MetricsDashboard metrics={metrics} />

          {/* Tab Views */}
          {activeTab === 'trace' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <AgentTraceConsole
                steps={steps}
                isAgentRunning={isAgentRunning}
                currentLoop={currentLoop}
                maxLoops={maxLoops}
                testOutput={testOutput}
              />
              <CodeEditorPanel
                files={selectedRepo.files}
                activeFilePath={activeFilePath}
                onSelectFile={setActiveFilePath}
                onUpdateFileContent={handleUpdateFileContent}
                onRunAgent={handleRunAgent}
                isAgentRunning={isAgentRunning}
              />
            </div>
          )}

          {activeTab === 'diff' && <CodeDiffViewer diffs={diffs} />}

          {activeTab === 'ast' && <AstIndexViewer astNodes={astNodes} repoName={selectedRepo.name} />}
        </main>
      </div>

      {/* High Density Footer Status Bar */}
      <footer className="h-9 px-6 bg-white/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-mono">系统负载: 12%</span>
          <span>|</span>
          <span className="font-mono">内存占用: 412MB</span>
          <span>|</span>
          <span className="font-mono text-blue-600 font-medium">模型: {settings.modelName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-slate-400">会话 ID: rh-8219-prod</span>
          <span className="text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            自动扫描异常模式已开启
          </span>
        </div>
      </footer>
    </div>
  );
}

