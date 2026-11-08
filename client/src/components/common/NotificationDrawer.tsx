import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, Calendar, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      // ignore
    }
  };

  const markOneRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      if (link) {
        navigate(link);
        onClose();
      }
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'exam':
        return <Calendar size={18} className="text-rose-500" />;
      case 'assignment':
        return <BookOpen size={18} className="text-indigo-500" />;
      case 'study':
        return <Clock size={18} className="text-emerald-500" />;
      default:
        return <Bell size={18} className="text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Notifications</h3>
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                {notifications.filter((n) => !n.is_read).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              title="Mark all as read"
              className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <CheckCheck size={16} />
              <span>Mark all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <Bell size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
              <p>No notifications yet</p>
              <p className="text-xs text-slate-500 mt-1">You're all caught up with your college schedule!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markOneRead(n.id, n.link)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  !n.is_read
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      {n.link && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
