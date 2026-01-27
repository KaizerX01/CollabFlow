import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  FolderOpen,
  Loader2,
  Sparkles,
  TrendingUp,
  Grid3x3,
  Zap,
} from 'lucide-react';
import { useTeamProjects } from '../hooks/useProjects';
import { PremiumBackground } from '../components/PremiumBackground';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { EditProjectDialog } from '../components/EditProjectDialog';
import { DeleteProjectDialog } from '../components/DeleteProjectDialog';
import type { ProjectResponse } from '../api/projects';

export const ProjectList: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: projects, isLoading, error } = useTeamProjects(teamId!);
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null);
  const [deleteProject, setDeleteProject] = useState<ProjectResponse | null>(null);

  const handleOpenProject = (projectId: string) => {
    navigate(`/teams/${teamId}/projects/${projectId}`);
  };

  if (!teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Team ID is missing</p>
      </div>
    );
  }

  return (
    <>
      <PremiumBackground variant="projects" intensity="medium">
        <div className="min-h-screen">
          <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link to={`/teams/${teamId}`}>
                    <motion.button
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors group"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>

                  <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <FolderOpen className="w-10 h-10 text-orange-400" />
                      </motion.div>
                      Team Projects
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Manage and organize your team's work
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  New Project
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-12 h-12 text-orange-400" />
                </motion.div>
                <p className="text-slate-400 mt-4 font-medium">Loading projects...</p>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-red-400 font-medium">Failed to load projects</p>
                <p className="text-slate-400 text-sm mt-2">Please try again later</p>
              </motion.div>
            )}

            {!isLoading && !error && projects && projects.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-purple-500/30 rounded-full blur-3xl" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
                    <FolderOpen className="w-16 h-16 text-slate-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8">No Projects Yet</h3>
                <p className="text-slate-400 mt-2 max-w-md text-center">Create your first project to get started.</p>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsCreateOpen(true)} className="mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                  <Zap className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {!isLoading && !error && projects && projects.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <Grid3x3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{projects.length}</p>
                          <p className="text-sm text-slate-400">Total Projects</p>
                        </div>
                      </div>

                      <div className="h-12 w-px bg-white/10" />

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{projects.length}</p>
                          <p className="text-sm text-slate-400">Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-semibold">All systems operational</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProjectCard
                          project={project}
                          onEdit={() => setEditProject(project)}
                          onDelete={() => setDeleteProject(project)}
                          onClick={() => handleOpenProject(project.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </PremiumBackground>

      <CreateProjectDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} teamId={teamId} />

      {editProject && (
        <EditProjectDialog
          isOpen={!!editProject}
          onClose={() => setEditProject(null)}
          projectId={editProject.id}
          currentName={editProject.name}
          currentDescription={editProject.description || undefined}
          teamId={teamId}
        />
      )}

      {deleteProject && (
        <DeleteProjectDialog
          isOpen={!!deleteProject}
          onClose={() => setDeleteProject(null)}
          projectId={deleteProject.id}
          projectName={deleteProject.name}
          teamId={teamId}
        />
      )}
    </>
  );
};