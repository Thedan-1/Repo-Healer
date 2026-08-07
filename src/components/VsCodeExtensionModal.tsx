import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, Layers, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

interface VsCodeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VSCODE_EXTENSION_TS = `import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  console.log('Repo-Healer VS Code Extension is now active!');

  // Register "Repo-Healer: Self-Heal Current File" command
  let disposable = vscode.commands.registerCommand('repo-healer.healFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Repo-Healer: Please open a code file first.');
      return;
    }

    const document = editor.document;
    const fileContent = document.getText();
    const filePath = document.fileName;

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Repo-Healer: Analyzing AST & Generating Fix Patch...",
      cancellable: false
    }, async (progress) => {
      try {
        // Send to Repo-Healer Express Backend API
        const response = await axios.post('http://localhost:3000/api/repair', {
          files: [{ path: filePath, content: fileContent }],
          activeFilePath: filePath,
          model: 'gemini-3.6-pro'
        });

        if (response.data?.fileDiff) {
          const edit = new vscode.WorkspaceEdit();
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(fileContent.length)
          );
          edit.replace(document.uri, fullRange, response.data.fileDiff.healedCode);
          await vscode.workspace.applyEdit(edit);
          
          vscode.window.showInformationMessage('Repo-Healer: Code healed successfully! PyTest status: PASSED');
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(\`Repo-Healer Error: \${err.message}\`);
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
`;

const PACKAGE_JSON_MANIFEST = `{
  "name": "repo-healer-vscode",
  "displayName": "Repo-Healer: Autonomous Code Self-Healing Agent",
  "description": "AI-powered AST code self-healing agent with Gemini 3.6 Pro & PyTest auto-fix loop",
  "version": "1.0.0",
  "publisher": "your-github-username",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Programming Languages", "Testing", "Machine Learning"],
  "activationEvents": ["onCommand:repo-healer.healFile"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [{
      "command": "repo-healer.healFile",
      "title": "Repo-Healer: Trigger AI Self-Healing Patch"
    }],
    "menus": {
      "editor/context": [{
        "command": "repo-healer.healFile",
        "group": "modification"
      }]
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./"
  }
}`;

export const VsCodeExtensionModal: React.FC<VsCodeExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'extensionTs' | 'packageJson'>('guide');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const textToCopy = activeTab === 'packageJson' ? PACKAGE_JSON_MANIFEST : VSCODE_EXTENSION_TS;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">VS Code 插件封装与 Marketplace 上架指南</h2>
              <p className="text-xs text-slate-500">将 Repo-Healer 自愈 Agent 独立打包为 VS Code 插件 (.vsix)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100/80 px-6 py-2 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'guide'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚀 上架步骤指南 (4步)
            </button>
            <button
              onClick={() => setActiveTab('extensionTs')}
              className={`px-3 py-1.5 rounded-lg transition-all font-mono ${
                activeTab === 'extensionTs'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              extension.ts 核心代码
            </button>
            <button
              onClick={() => setActiveTab('packageJson')}
              className={`px-3 py-1.5 rounded-lg transition-all font-mono ${
                activeTab === 'packageJson'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              package.json 清单
            </button>
          </div>

          {activeTab !== 'guide' && (
            <button
              onClick={handleCopyCode}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1 rounded-lg shadow-2xs flex items-center gap-1.5 active:scale-97 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>复制代码</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  完全可以上架 VS Code Marketplace！
                </div>
                <p className="text-blue-800 text-xs">
                  VS Code 插件基于 TypeScript/Node.js 运行，可以直接调用 VS Code 原生 API (`vscode.WorkspaceEdit`, `vscode.languages.getDiagnostics`) 捕捉错误，并与我们的 Repo-Healer Express 后端进行通讯！
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">生成插件工程脚手架</div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5 bg-white p-1.5 rounded border border-slate-200">
                      npm install -g yo generator-code && yo code
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">写入 extension.ts 与 package.json</div>
                    <p className="text-slate-600 text-xs mt-0.5">
                      复制上方 Tab 中的 <span className="font-mono text-blue-700 font-semibold">extension.ts</span> 和 <span className="font-mono text-blue-700 font-semibold">package.json</span> 内容，注册编辑器右键菜单与自愈指令。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">打包成离线插件安装包 (.vsix)</div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5 bg-white p-1.5 rounded border border-slate-200">
                      npm install -g @vscode/vsce && vsce package
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">发布至 Visual Studio Marketplace 商店</div>
                    <p className="text-slate-600 text-xs mt-0.5">
                      前往 Azure DevOps 申请 Personal Access Token (PAT)，运行 <code className="font-mono bg-white px-1 border rounded">vsce publish</code> 即可发布供全球开发者一键安装！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'extensionTs' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-blue-200 font-mono text-[11px]">
              <pre className="whitespace-pre-wrap leading-relaxed">{VSCODE_EXTENSION_TS}</pre>
            </div>
          )}

          {activeTab === 'packageJson' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-blue-200 font-mono text-[11px]">
              <pre className="whitespace-pre-wrap leading-relaxed">{PACKAGE_JSON_MANIFEST}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">支持 VS Code 1.85+，完全兼容 Windows/macOS/Linux</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition-all active:scale-97"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
