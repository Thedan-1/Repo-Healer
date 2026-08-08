import React, { useState, useRef } from 'react';
import { RepoFile, SampleRepo } from '../types';
import { Upload, FileCode2, FolderPlus, Plus, Check, X, Code2, Layers, AlertCircle, FileText } from 'lucide-react';

interface CodeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (newRepo: SampleRepo) => void;
}

export const CodeUploadModal: React.FC<CodeUploadModalProps> = ({
  isOpen,
  onClose,
  onImportProject,
}) => {
  const [projectName, setProjectName] = useState('My-Local-Project');
  const [projectDesc, setProjectDesc] = useState('本地导入的 Python / TS 代码库项目');
  const [importedFiles, setImportedFiles] = useState<RepoFile[]>([
    {
      path: 'main.py',
      language: 'python',
      content: `# 本地导入的代码入口文件\ndef run_pipeline(items):\n    # TODO: 接入自愈算法与 PyTest 断言\n    results = []\n    for item in items:\n        if item != 0:\n            results.append(100 / item)\n    return results\n`,
      hasBug: true,
      bugDescription: '潜在除零与空列表传参边界',
    },
    {
      path: 'test_main.py',
      language: 'python',
      content: `import pytest\nfrom main import run_pipeline\n\ndef test_run_pipeline():\n    assert run_pipeline([10, 20]) == [10.0, 5.0]\n    # 边缘条件测试\n    assert run_pipeline([0]) == []\n`,
    },
  ]);

  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const [pastedPath, setPastedPath] = useState('service.py');
  const [pastedContent, setPastedContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: RepoFile[] = [];
    const readPromises: Promise<void>[] = [];

    (Array.from(files) as File[]).forEach((file: File) => {
      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const ext = file.name.split('.').pop()?.toLowerCase();
          const language: 'python' | 'typescript' | 'javascript' =
            ext === 'py' ? 'python' : ext === 'ts' || ext === 'tsx' ? 'typescript' : 'javascript';

          newFiles.push({
            path: file.name,
            language,
            content,
            hasBug: content.includes('/') || content.includes('def '),
            bugDescription: '自愈引擎扫描分析',
          });
          resolve();
        };
        reader.readAsText(file);
      });
      readPromises.push(promise);
    });

    Promise.all(readPromises).then(() => {
      setImportedFiles((prev) => [...prev, ...newFiles]);
    });
  };

  const handleAddPastedFile = () => {
    if (!pastedPath.trim() || !pastedContent.trim()) return;

    const ext = pastedPath.split('.').pop()?.toLowerCase();
    const language: 'python' | 'typescript' | 'javascript' =
      ext === 'py' ? 'python' : ext === 'ts' || ext === 'tsx' ? 'typescript' : 'javascript';

    setImportedFiles((prev) => [
      ...prev,
      {
        path: pastedPath,
        language,
        content: pastedContent,
        hasBug: true,
        bugDescription: '用户自定义代码块分析',
      },
    ]);

    setPastedPath('utils.py');
    setPastedContent('');
  };

  const handleRemoveFile = (path: string) => {
    setImportedFiles((prev) => prev.filter((f) => f.path !== path));
  };

  const handleConfirmImport = () => {
    if (importedFiles.length === 0) return;

    const newRepo: SampleRepo = {
      id: `custom-repo-${Date.now()}`,
      name: projectName,
      description: projectDesc,
      language: importedFiles[0]?.language === 'python' ? 'Python 3.11' : 'TypeScript',
      files: importedFiles,
    };

    onImportProject(newRepo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-500/30 text-blue-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">导入 / 选择本地代码工程 (Import Codebase)</h3>
              <p className="text-[11px] text-slate-400">
                拖拽、上传本地 Python/TS 源码文件或文本代码块，自动触发 AST 语法解析
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <label className="font-bold text-slate-700 block mb-1">工程名称 (Project Name)</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">工程描述 (Description)</label>
              <input
                type="text"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveInputTab('upload')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeInputTab === 'upload'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              文件拖拽 / 本地选择
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('paste')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeInputTab === 'paste'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              直接粘贴代码文本
            </button>
          </div>

          {/* Upload Drop Zone */}
          {activeInputTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".py,.ts,.tsx,.js,.jsx,.json,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-xs">
                点击选择文件，或直接将代码拖拽至此处
              </div>
              <p className="text-[11px] text-slate-400">
                支持 Python (.py)、TypeScript (.ts)、JavaScript (.js)、JSON 与文本声明文件
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <label className="font-bold text-slate-700 block mb-1">文件路径 / 文件名</label>
                <input
                  type="text"
                  value={pastedPath}
                  onChange={(e) => setPastedPath(e.target.value)}
                  placeholder="e.g. services/calc.py"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">代码内容 (Code Content)</label>
                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  rows={5}
                  placeholder="粘贴你的 Python 函数或测试代码..."
                  className="w-full bg-slate-900 text-blue-100 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPastedFile}
                disabled={!pastedContent.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                添加此文件至工程
              </button>
            </div>
          )}

          {/* Imported Files List */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>已选文件列表 ({importedFiles.length} 个)</span>
              <span className="text-[10px] text-slate-400">将创建为全新独立代码工程</span>
            </label>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {importedFiles.map((file) => (
                <div
                  key={file.path}
                  className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold font-mono text-slate-800">{file.path}</span>
                      <span className="ml-2 text-[10px] font-mono uppercase bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">
                        {file.language}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(file.path)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            系统将自动对导入的 {importedFiles.length} 个文件建立 AST 图谱
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-all"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={importedFiles.length === 0}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>确认导入并建立工程</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
