import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  footer,
  maxWidth = 'md'
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop - MUST be rendered first */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
                style={{ pointerEvents: 'auto' }}
              />
            </Dialog.Overlay>

            {/* Modal Content - Higher z-index than overlay */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 30,
                    mass: 0.8
                  }}
                  className={`w-full ${maxWidthClasses[maxWidth]} pointer-events-auto`}
                >
                  {/* Premium glow effect */}
                  <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-75 blur-2xl animate-pulse" />
                  
                  {/* Main container with frosted glass */}
                  <div className="relative rounded-[20px] border border-slate-200/20 dark:border-slate-700/30 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    {/* Animated mesh gradient background */}
                    <div className="absolute inset-0 opacity-40">
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          background: [
                            'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
                            'radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)',
                            'radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 60%)',
                            'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
                          ],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>

                    {/* Subtle dot pattern */}
                    <div 
                      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                      style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    {/* Header with gradient border */}
                    <div className="relative">
                      {/* Top gradient line */}
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                      
                      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
                        <Dialog.Title asChild>
                          {typeof title === 'string' ? (
                            <h2 className="text-xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                              {title}
                            </h2>
                          ) : (
                            <div>{title}</div>
                          )}
                        </Dialog.Title>
                        
                        <Dialog.Close asChild>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="group relative rounded-xl p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                          >
                            {/* Hover background */}
                            <div className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <X className="relative h-5 w-5" />
                          </motion.button>
                        </Dialog.Close>
                      </div>
                    </div>

                    {/* Body with custom scrollbar */}
                    <div 
                      className="relative px-6 py-6 max-h-[calc(100vh-16rem)] overflow-y-auto
                        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700
                        hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600"
                    >
                      {children}
                    </div>

                    {/* Footer with top gradient */}
                    {footer && (
                      <div className="relative">
                        {/* Top gradient fade */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent" />
                        
                        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
                          {footer}
                        </div>
                      </div>
                    )}

                    {/* Bottom shine effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
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