import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Sparkles, Loader2 } from 'lucide-react';
import { useCreateProject } from '../hooks/useProjects';
import type { ProjectCreateRequest } from '../api/projects';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject(teamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: ProjectCreateRequest = {
      teamId,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      await createProject.mutateAsync(data);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleClose = () => {
    if (!createProject.isPending) {
      setName('');
      setDescription('');
      onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />

              {/* Main container */}
              <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Animated gradient header */}
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
                        'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(139, 92, 246, 0.3) 100%)',
                      backgroundSize: '200% 200%',
                    }}
                  />

                  {/* Floating orbs */}
                  <motion.div
                    animate={{
                      x: [0, 30, 0],
                      y: [0, -20, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-0 w-32 h-32 bg-orange-500/40 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      x: [0, -30, 0],
                      y: [0, 20, 0],
                      scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/40 rounded-full blur-3xl"
                  />

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl blur-xl opacity-60" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                        <FolderPlus className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Create New Project
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Start building something amazing
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      disabled={createProject.isPending}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Project Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Project Name <span className="text-red-400">*</span>
                      </label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Website Redesign"
                          disabled={createProject.isPending}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          autoFocus
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Description{' '}
                        <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        className="relative"
                      >
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What's this project about?"
                          disabled={createProject.isPending}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        disabled={createProject.isPending}
                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </motion.button>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!name.trim() || createProject.isPending}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {createProject.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <FolderPlus className="w-4 h-4" />
                            Create Project
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Bottom gradient line */}
                <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};