import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    shell: 'from-emerald-400/20 via-emerald-500/20 to-cyan-500/25 border-emerald-300/40 shadow-emerald-500/30',
    text: 'text-emerald-50',
    icon: 'text-emerald-200',
    accent: 'from-emerald-400/80 via-teal-400/70 to-cyan-400/80',
    Icon: CheckCircle,
  },
  error: {
    shell: 'from-rose-400/25 via-red-500/25 to-orange-500/25 border-rose-300/40 shadow-rose-500/30',
    text: 'text-rose-50',
    icon: 'text-rose-200',
    accent: 'from-rose-400/80 via-red-500/80 to-orange-400/80',
    Icon: AlertCircle,
  },
  info: {
    shell: 'from-sky-400/25 via-blue-500/20 to-indigo-500/25 border-sky-300/40 shadow-sky-500/30',
    text: 'text-sky-50',
    icon: 'text-sky-200',
    accent: 'from-sky-400/80 via-blue-500/80 to-indigo-400/80',
    Icon: Info,
  },
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 4800,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = toastConfig[type];
  const IconComponent = config.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={`relative overflow-hidden rounded-2xl border bg-slate-950/80 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/50 min-w-[340px] max-w-xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.shell}`}></div>
      <div className="absolute inset-[-1px] rounded-2xl border border-white/10"></div>
      <div className="relative flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 18 }}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/70 border border-white/10 shadow-inner shadow-black/30"
        >
          <IconComponent className={`h-6 w-6 ${config.icon}`} />
        </motion.div>

        <div className="flex-1 space-y-1">
          <p className={`text-sm font-semibold leading-6 tracking-tight ${config.text}`}>
            {message}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`h-full bg-gradient-to-r ${config.accent} shadow-[0_0_18px_rgba(255,255,255,0.35)]`}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 6 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className={`mt-1 rounded-lg border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-wide ${config.text} transition-colors hover:bg-white/10`}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      <div className={`pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full blur-3xl bg-gradient-to-br ${config.accent} opacity-30`}></div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};