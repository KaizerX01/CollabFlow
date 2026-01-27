import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Save, Loader2 } from 'lucide-react';
import { useUpdateProject } from '../hooks/useProjects';
import type { ProjectUpdateRequest } from '../api/projects';

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentName: string;
  currentDescription?: string;
  teamId: string;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  currentName,
  currentDescription,
  teamId,
}) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const updateProject = useUpdateProject(teamId);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription || '');
    }
  }, [isOpen, currentName, currentDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: ProjectUpdateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      await updateProject.mutateAsync({ projectId, data });
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleClose = () => {
    if (!updateProject.isPending) {
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-3xl blur-2xl" />

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
                        'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(20, 184, 166, 0.3) 100%)',
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
                    className="absolute top-0 left-0 w-32 h-32 bg-blue-500/40 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      x: [0, -30, 0],
                      y: [0, 20, 0],
                      scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/40 rounded-full blur-3xl"
                  />

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl blur-xl opacity-60" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                        <Edit3 className="w-8 h-8 text-white" strokeWidth={2} />
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
                        Edit Project
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Update your project details
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      disabled={updateProject.isPending}
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
                          disabled={updateProject.isPending}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          autoFocus
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
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
                          disabled={updateProject.isPending}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
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
                        disabled={updateProject.isPending}
                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </motion.button>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!name.trim() || updateProject.isPending}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updateProject.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Bottom gradient line */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};