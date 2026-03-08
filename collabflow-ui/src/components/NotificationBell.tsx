import React from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';

const formatTime = (iso: string) => {
  const value = new Date(iso);
  return value.toLocaleString();
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    isConnected,
    isPanelOpen,
    setPanelOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-[70]">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setPanelOpen(!isPanelOpen)}
        className="relative h-14 w-14 rounded-2xl border border-white/15 bg-slate-900/90 text-white shadow-xl shadow-black/40 backdrop-blur-xl"
        aria-label="Notifications"
      >
        <Bell className="mx-auto h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-2 -top-2 min-w-[24px] rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="absolute bottom-16 right-0 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-xs text-slate-400">
                  {isConnected ? 'Live updates connected' : 'Reconnecting live updates...'}
                </p>
              </div>
              <button
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</div>
              )}

              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={async () => {
                    await markAsRead(item.id);
                    if (item.route) {
                      navigate(item.route);
                      setPanelOpen(false);
                    }
                  }}
                  className="block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/5"
                >
                  <div className="flex items-start gap-3">
                    <Circle className={`mt-1 h-2.5 w-2.5 ${item.isRead ? 'text-slate-600' : 'text-sky-400'}`} fill="currentColor" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-300">{item.message}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{formatTime(item.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
