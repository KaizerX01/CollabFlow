import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Users, Zap } from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { TeamCard } from '../components/TeamCard';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { CardSkeleton, Button } from '../components/shared';
import { PremiumBackground } from '../components/PremiumBackground';

export const TeamsList: React.FC = () => {
  const navigate = useNavigate();
  const { data: teams, isLoading, error } = useTeams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (error) {
    return (
      <PremiumBackground variant="teams" intensity="low">
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Error card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-md w-full mx-4"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
              >
                <Zap className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">
                Connection Lost
              </h3>
              <p className="text-slate-400 text-center mb-8">
                Failed to load teams. Please check your connection and try again.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground variant="teams" intensity="medium">
      <div className="min-h-screen relative overflow-hidden">
        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              {/* Animated icon badge */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="hidden sm:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <Users className="h-8 w-8 text-white" />
              </motion.div>

              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent"
                >
                  Teams
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-lg text-slate-400 font-medium"
                >
                  Manage and collaborate with your teams
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={() => setCreateDialogOpen(true)} 
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 border-0 text-white font-semibold shadow-xl shadow-purple-500/25 transition-all duration-300 group px-6 py-3 h-12"
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative flex items-center gap-2.5">
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Team</span>
                  <Sparkles className="h-4 w-4 opacity-75" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Teams grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardSkeleton />
              </motion.div>
            ) : teams && teams.length > 0 ? (
              <motion.div
                key="teams-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.2,
                    },
                  },
                }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 30,
                        },
                      },
                    }}
                  >
                    <TeamCard
                      team={team}
                      onViewDetails={() => navigate(`/teams/${team.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl p-16 text-center overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                
                {/* Floating orbs */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-8 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{
                    y: [0, 20, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-8 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"
                />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      delay: 0.2 
                    }}
                    className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Users className="h-12 w-12 text-blue-400" />
                  </motion.div>

                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-3"
                  >
                    No teams yet
                  </motion.h3>

                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-lg mb-8 max-w-md mx-auto"
                  >
                    Create your first team to start collaborating with others
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={() => setCreateDialogOpen(true)} 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold shadow-xl shadow-purple-500/25 px-8 h-12"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Team
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dialog */}
        <CreateTeamDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </PremiumBackground>
  );
};