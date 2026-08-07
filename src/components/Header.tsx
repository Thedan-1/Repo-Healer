import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Activity,
  Github,
  FileCode,
  Cpu,
  Bell,
  Sliders,
  Code2,
  ChevronDown,
  User,
  Shield,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';
import { SettingsModal } from './SettingsModal';
import { VsCodeExtensionModal } from './VsCodeExtensionModal';
import { NotificationItem, SystemSettings } from '../types';

interface HeaderProps {
  hasApiKey: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunAgent: () => void;
  isAgentRunning: boolean;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  activeTab,
  setActiveTab,
  onRunAgent,
  isAgentRunning,
  settings,
  onUpdateSettings,
  notifications,
  onMarkAllRead,
  onClearNotifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVsCodeModal, setShowVsCodeModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'busy' | 'auto'>('online');

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs">
        {/* Layer 1: Top Brand, Navigation, User Avatar, Quick Settings Bar */}
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm tracking-wide shrink-0">
              RH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2">
                  Repo-Healer <span className="text-[11px] font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">v2.4-PRO</span>
                </h1>
                <span className="hidden sm:flex text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Agent 监听中
                </span>
              </div>
              <p className="text-[12px] text-slate-500 font-normal hidden sm:block">
                自主代码修复 Agent 与 AST 语法树重构架构
              </p>
            </div>
          </div>

          {/* Center/Right Toolbar: VS Code Plugin, Settings, Notifications, Avatar */}
          <div className="flex items-center gap-2.5">
            {/* VS Code Plugin Modal Trigger */}
            <button
              onClick={() => setShowVsCodeModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs border border-slate-200/80 transition-all shadow-2xs active:scale-97"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>VS Code 插件指南</span>
            </button>

            {/* System Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 transition-all shadow-2xs active:scale-97"
              title="系统设置"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 transition-all shadow-2xs active:scale-97 relative"
                title="通知中心"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationsPopover
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAllRead={onMarkAllRead}
                onClearAll={onClearNotifications}
              />
            </div>

            {/* Run Agent Action Button */}
            <button
              onClick={onRunAgent}
              disabled={isAgentRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-600/20 active:scale-97 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAgentRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>自愈修复中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-100 animate-pulse" />
                  <span>触发 Agent 自愈</span>
                </>
              )}
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative ml-1 pl-2 border-l border-slate-200">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all"
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      userStatus === 'online'
                        ? 'bg-emerald-500'
                        : userStatus === 'busy'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 z-50 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Alex Chen</div>
                        <div className="text-[11px] text-slate-500 font-mono">Senior AI Architect</div>
                        <div className="text-[10px] text-blue-600 font-semibold mt-0.5">alex.chen@repo-healer.ai</div>
                      </div>
                    </div>
                  </div>

                  {/* Status switcher */}
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    工作状态
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-2 px-1">
                    <button
                      onClick={() => setUserStatus('online')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        userStatus === 'online' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      在线
                    </button>
                    <button
                      onClick={() => setUserStatus('busy')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        userStatus === 'busy' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      忙碌
                    </button>
                    <button
                      onClick={() => setUserStatus('auto')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        userStatus === 'auto' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Agent 接管
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 space-y-0.5 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>偏好设置</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowVsCodeModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>VS Code 扩展绑定</span>
                    </button>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                    >
                      <Github className="w-3.5 h-3.5 text-slate-500" />
                      <span>GitHub 仓库</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layer 2: Segmented Navigation Bar */}
        <div className="bg-slate-50/90 border-t border-slate-200/60 px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-medium max-w-full overflow-x-auto shadow-inner">
              <button
                onClick={() => setActiveTab('trace')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'trace'
                    ? 'bg-white text-blue-700 font-bold shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Agent 追踪日志 (Trace)</span>
              </button>

              <button
                onClick={() => setActiveTab('diff')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'diff'
                    ? 'bg-white text-blue-700 font-bold shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>代码 Diff 变更</span>
              </button>

              <button
                onClick={() => setActiveTab('ast')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'ast'
                    ? 'bg-white text-blue-700 font-bold shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>AST 语法树解析与静态巡检</span>
              </button>
            </nav>

            <div className="hidden lg:flex items-center gap-4 text-slate-500 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                模型: <strong className="text-slate-800">{settings.modelName}</strong>
              </span>
              <span>|</span>
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <Zap className="w-3.5 h-3.5" />
                WS 通信已建连
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* VS Code Extension Modal */}
      <VsCodeExtensionModal
        isOpen={showVsCodeModal}
        onClose={() => setShowVsCodeModal(false)}
      />
    </>
  );
};
