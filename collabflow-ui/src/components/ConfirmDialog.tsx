import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Zap, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  isLoading = false,
}) => {
  const variantConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'from-red-500 to-pink-500',
      iconGlow: 'from-red-500/30 to-pink-500/30',
      buttonBg: 'from-red-500 to-pink-600',
      buttonHover: 'from-red-600 to-pink-700',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'from-amber-500 to-orange-500',
      iconGlow: 'from-amber-500/30 to-orange-500/30',
      buttonBg: 'from-amber-500 to-orange-600',
      buttonHover: 'from-amber-600 to-orange-700',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    info: {
      icon: Zap,
      iconBg: 'from-blue-500 to-purple-500',
      iconGlow: 'from-blue-500/30 to-purple-500/30',
      buttonBg: 'from-blue-500 to-purple-600',
      buttonHover: 'from-blue-600 to-purple-700',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
                style={{ pointerEvents: 'auto' }}
              />
            </Dialog.Overlay>

            {/* Modal Content */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="w-full max-w-md pointer-events-auto relative"
                >
                  {/* Premium glow effect */}
                  <div className={`absolute -inset-2 rounded-[28px] bg-gradient-to-r ${config.iconGlow} opacity-40 blur-2xl`} />

                  {/* Main container */}
                  <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    {/* Animated mesh gradient background */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      animate={{
                        background: [
                          `radial-gradient(circle at 20% 30%, ${variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : variant === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'} 0%, transparent 50%)`,
                          `radial-gradient(circle at 80% 70%, ${variant === 'danger' ? 'rgba(236, 72, 153, 0.15)' : variant === 'warning' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(168, 85, 247, 0.15)'} 0%, transparent 50%)`,
                          `radial-gradient(circle at 20% 30%, ${variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : variant === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'} 0%, transparent 50%)`,
                        ],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Close button */}
                    <Dialog.Close asChild>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute top-4 right-4 z-10 rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </Dialog.Close>

                    {/* Content */}
                    <div className="relative p-8 text-center">
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 15,
                          delay: 0.1,
                        }}
                        className="mb-6 inline-flex"
                      >
                        <div className="relative">
                          {/* Pulsing glow */}
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.iconGlow} blur-xl`}
                          />
                          <div className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-xl`}>
                            <Icon className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Title */}
                      <Dialog.Title asChild>
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl font-bold text-white mb-3"
                        >
                          {title}
                        </motion.h2>
                      </Dialog.Title>

                      {/* Description */}
                      <Dialog.Description asChild>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-slate-400 text-base leading-relaxed mb-8"
                        >
                          {description}
                        </motion.p>
                      </Dialog.Description>

                      {/* Warning badge (for danger/warning variants) */}
                      {(variant === 'danger' || variant === 'warning') && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${variant === 'danger' ? 'from-red-500/10 to-pink-500/10 border-red-500/30' : 'from-amber-500/10 to-orange-500/10 border-amber-500/30'} border mb-8`}
                        >
                          <AlertTriangle className={`h-4 w-4 ${config.textColor}`} />
                          <span className="text-sm font-semibold text-slate-300">
                            This action cannot be undone
                          </span>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-3"
                      >
                        {/* Cancel button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onOpenChange(false)}
                          className="flex-1 px-5 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all duration-200"
                        >
                          {cancelLabel}
                        </motion.button>

                        {/* Confirm button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirm}
                          disabled={isLoading}
                          className="flex-1 relative px-5 py-3 rounded-xl font-semibold shadow-xl transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${config.buttonBg} rounded-xl`} />
                          <div className={`absolute inset-0 bg-gradient-to-r ${config.buttonHover} rounded-xl opacity-0 hover:opacity-100 transition-opacity`} />

                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />

                          <span className="relative text-white flex items-center justify-center gap-2">
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                />
                                Processing...
                              </>
                            ) : (
                              confirmLabel
                            )}
                          </span>
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Bottom gradient line */}
                    <div className={`h-1 bg-gradient-to-r ${variant === 'danger' ? 'from-red-500/30 via-pink-500/30 to-red-500/30' : variant === 'warning' ? 'from-amber-500/30 via-orange-500/30 to-amber-500/30' : 'from-blue-500/30 via-purple-500/30 to-blue-500/30'}`} />
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};