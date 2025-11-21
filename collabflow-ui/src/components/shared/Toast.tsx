import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700',
    text: 'text-emerald-800 dark:text-emerald-200',
    icon: 'text-emerald-500 dark:text-emerald-400',
    Icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-500 dark:text-red-400',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-500 dark:text-blue-400',
    Icon: Info,
  },
};

export const Toast: React.FC<ToastProps> = ({ 
  id,
  type, 
  message, 
  onClose, 
  duration = 5000 
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
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl ${config.bg} min-w-[320px] max-w-md`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${config.icon}`} />
      </motion.div>
      
      <p className={`flex-1 text-sm font-medium ${config.text}`}>
        {message}
      </p>
      
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className={`flex-shrink-0 ${config.text} hover:opacity-75 transition-opacity rounded-lg p-1`}
      >
        <X className="h-4 w-4" />
      </motion.button>
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
              id={toast.id}
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