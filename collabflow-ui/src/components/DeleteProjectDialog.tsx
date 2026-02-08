import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteProject } from '../hooks/useProjects';
import { useToast } from '../hooks/use-toast';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  teamId: string;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  teamId,
}) => {
  const deleteProject = useDeleteProject(teamId);
  const { showToast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      showToast('success', 'Project deleted');
      onClose();
    } catch (error) {
      console.error('Failed to delete project:', error);
      showToast('error', 'Could not delete project.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect - red theme */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 via-rose-500/30 to-pink-500/30 rounded-3xl blur-2xl" />

              {/* Main container */}
              <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden">
                {/* Animated gradient header - danger theme */}
                <div className="relative h-32 overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 50%, rgba(185, 28, 28, 0.3) 100%)',
                      backgroundSize: '200% 200%',
                    }}
                  />

                  {/* Floating warning orbs */}
                  <motion.div
                    animate={{
                      x: [0, 30, 0],
                      y: [0, -20, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-0 w-32 h-32 bg-red-500/40 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      x: [0, -30, 0],
                      y: [0, 20, 0],
                      scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/40 rounded-full blur-3xl"
                  />

                  {/* Warning Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl blur-xl opacity-60" />
                      <motion.div
                        animate={{ rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="relative w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl"
                      >
                        <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2} />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Delete Project
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        This action cannot be undone
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      disabled={deleteProject.isPending}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Warning message */}
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Are you sure you want to delete{' '}
                          <span className="font-bold text-white">"{projectName}"</span>?
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          All associated data will be permanently removed from our servers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mb-6" />

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      disabled={deleteProject.isPending}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={deleteProject.isPending}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white font-semibold shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleteProject.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete Project
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Bottom gradient line */}
                <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-rose-600" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};