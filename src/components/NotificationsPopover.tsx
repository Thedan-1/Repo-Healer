import React from 'react';
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-xs text-slate-900">系统通知与 Agent 消息</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onMarkAllRead}
            className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
            title="全部标记已读"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            已读
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-600 p-1 rounded"
            title="清空"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            暂无新通知
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 transition-colors ${
                item.read ? 'bg-white opacity-70' : 'bg-blue-50/40 font-medium'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {item.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                {item.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-900">
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
