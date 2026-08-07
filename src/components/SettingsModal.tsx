import React from 'react';
import { X, Sliders, Cpu, Terminal, GitCommit, Code2, Check, Sparkles } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Repo-Healer Agent 系统设置</h2>
              <p className="text-xs text-slate-500">配置 LLM 引擎参数、自愈循环阈值及 IDE 同步策略</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Model Provider Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              LLM 模型提供商 (Model Provider)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'google', name: 'Gemini (Google)' },
                { id: 'openai', name: 'OpenAI (ChatGPT)' },
                { id: 'ollama', name: 'Ollama 本地' },
                { id: 'custom', name: 'DeepSeek / 自定义' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      modelProvider: prov.id as any,
                      modelName:
                        prov.id === 'google'
                          ? 'gemini-3.6-pro'
                          : prov.id === 'openai'
                          ? 'gpt-4o'
                          : prov.id === 'ollama'
                          ? 'qwen2.5-coder:7b'
                          : 'deepseek-coder-v2',
                    })
                  }
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                    settings.modelProvider === prov.id
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {prov.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              具体模型 (Model Name)
            </label>
            {settings.modelProvider === 'google' ? (
              <select
                value={settings.modelName}
                onChange={(e) => onUpdateSettings({ ...settings, modelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="gemini-3.6-pro">Gemini 3.6 Pro (推荐：高准确率补丁与推理)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (极速模式：低延迟)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (标准逻辑分析引擎)</option>
              </select>
            ) : settings.modelProvider === 'openai' ? (
              <select
                value={settings.modelName}
                onChange={(e) => onUpdateSettings({ ...settings, modelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="gpt-4o">GPT-4o (OpenAI 旗舰强逻辑模型)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (轻量高效代码补丁)</option>
                <option value="o3-mini">o3-mini (推理增强型模型)</option>
              </select>
            ) : (
              <input
                type="text"
                value={settings.customModelName || settings.modelName}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    modelName: e.target.value,
                    customModelName: e.target.value,
                  })
                }
                placeholder={settings.modelProvider === 'ollama' ? 'qwen2.5-coder:7b' : 'deepseek-coder-v2'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            )}
          </div>

          {/* Custom Endpoint / Base URL for Ollama & Custom Provider */}
          {(settings.modelProvider === 'ollama' || settings.modelProvider === 'custom') && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Base URL (API 接口服务地址)
                </label>
                <input
                  type="text"
                  value={
                    settings.customBaseUrl ||
                    (settings.modelProvider === 'ollama'
                      ? 'http://localhost:11434'
                      : 'https://api.deepseek.com/v1')
                  }
                  onChange={(e) => onUpdateSettings({ ...settings, customBaseUrl: e.target.value })}
                  placeholder={
                    settings.modelProvider === 'ollama'
                      ? 'http://localhost:11434'
                      : 'https://api.deepseek.com/v1'
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {settings.modelProvider === 'custom' && (
                <div>
                  <label className="font-bold text-slate-800 block mb-1">API Key (密钥)</label>
                  <input
                    type="password"
                    value={settings.customApiKey || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, customApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                代码生成随机度 (Temperature): <span className="font-mono text-blue-600">{settings.temperature}</span>
              </label>
              <span className="text-[11px] text-slate-400">更小值代表更确定性的补丁</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Max Healing Loops */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-600" />
              最大重试修复循环次数 (Max Healing Loops)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, maxHealingLoops: num })}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    settings.maxHealingLoops === num
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} 次
                </button>
              ))}
            </div>
          </div>

          {/* PyTest Flags */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              PyTest CLI 执行命令行参数
            </label>
            <input
              type="text"
              value={settings.pytestFlags}
              onChange={(e) => onUpdateSettings({ ...settings, pytestFlags: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Switches */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4 text-purple-600" />
                  自愈校验通过后自动暂存 Commit
                </div>
                <div className="text-[11px] text-slate-500">若测试绿灯通过，自动执行 git add 与人类化 commit</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCommit}
                onChange={(e) => onUpdateSettings({ ...settings, autoCommit: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  VS Code 插件双向通信模式
                </div>
                <div className="text-[11px] text-slate-500">启用 websocket 与 VS Code 本地扩展实时传输 diff</div>
              </div>
              <input
                type="checkbox"
                checked={settings.vscodePluginMode}
                onChange={(e) => onUpdateSettings({ ...settings, vscodePluginMode: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition-all active:scale-97 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
