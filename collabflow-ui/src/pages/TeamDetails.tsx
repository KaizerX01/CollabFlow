import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit3, Link2, LogOut, Users, Crown, Sparkles, Zap } from 'lucide-react';
import { useTeamDetails, useLeaveTeam } from '../hooks/useTeams';
import { MemberCard } from '../components/MemberCard';
import { EditTeamDialog } from '../components/EditTeamDialog';
import { InviteDialog } from '../components/InviteDialog';
import { ConfirmDialog } from '../components/ConfirmDialog'; // Ensure this path is correct
import { TeamDetailsSkeletons, Button } from '../components/shared';
import { PremiumBackground } from '../components/PremiumBackground';
import type { TeamMember } from '../api/teams';
import { useAuth } from '../context/AuthContext';

export const TeamDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading, error } = useTeamDetails(teamId || '');
  
  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false); // New state for confirm dialog
  
  const leaveTeamMutation = useLeaveTeam(teamId || '');
  const { currentUserId, isLoading: isAuthLoading } = useAuth();

  if (!teamId) {
    return (
      <PremiumBackground variant="teams" intensity="low">
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
                >
                  <Zap className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-3">Invalid Team ID</h3>
                <p className="text-slate-400 mb-8">This team doesn't exist or the link is broken.</p>
                <Button 
                  onClick={() => navigate('/teams')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-xl shadow-purple-500/25"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teams
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  if (isLoading || isAuthLoading) {
    return (
      <PremiumBackground variant="teams" intensity="medium">
        <div className="min-h-screen relative overflow-hidden">
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <motion.button
              onClick={() => navigate('/teams')}
              whileHover={{ x: -4 }}
              className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Teams
            </motion.button>
            <TeamDetailsSkeletons />
          </div>
        </div>
      </PremiumBackground>
    );
  }

  if (error || !team) {
    return (
      <PremiumBackground variant="teams" intensity="low">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <Zap className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-3">Failed to Load</h3>
                <p className="text-slate-400 mb-8">Something went wrong. Please try again.</p>
                <Button 
                  onClick={() => navigate('/teams')} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-xl shadow-purple-500/25"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teams
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  const currentUser: TeamMember | undefined = team.members.find(m => m.id === currentUserId);
  const currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' = currentUser?.role || 'MEMBER';
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  // Logic to execute when "Confirm" is clicked
  const onConfirmLeaveTeam = () => {
    leaveTeamMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/teams');
      },
      onError: (err) => {
        console.error("Failed to leave team:", err);
      }
    });
  };

  return (
    <PremiumBackground variant="teams" intensity="medium">
      <div className="min-h-screen relative overflow-hidden">
        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back button - Premium style */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/teams')}
            className="group mb-8 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 text-blue-400 hover:text-blue-300 transition-all duration-200 font-semibold shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Teams
          </motion.button>

          {/* Team header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative group mb-8"
          >
            {/* ... (Header content unchanged) ... */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-[28px] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl overflow-hidden">
               <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />

              <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6, type: 'spring' }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
                      <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>

                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-1">
                        {team.name}
                      </h1>
                      {currentUser?.role === 'OWNER' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                        >
                          <Crown className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-300">Team Owner</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <p className="text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
                    {team.description || 'No description provided'}
                  </p>
                </div>

                {canManage && (
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditDialogOpen(true)}
                      className="group relative px-5 py-3 rounded-xl overflow-hidden font-semibold transition-all duration-200"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all group-hover:bg-white/15" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      <span className="relative flex items-center gap-2 text-white">
                        <Edit3 className="h-4 w-4" />
                        Edit Team
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInviteDialogOpen(true)}
                      className="group relative px-5 py-3 rounded-xl overflow-hidden font-semibold shadow-xl shadow-purple-500/25 transition-all duration-200"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="relative flex items-center gap-2 text-white">
                        <Link2 className="h-4 w-4" />
                        Generate Invite
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Members section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
                  'radial-gradient(circle at 70% 60%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',
                  'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <span>
                    Team Members
                    <span className="ml-3 text-lg text-slate-400 font-semibold">({team.members?.length ?? 0})</span>
                  </span>
                </h2>
              </div>

              {team.members && team.members.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {team.members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: 0.05 * index, duration: 0.3 }}
                      >
                        <MemberCard
                          member={member}
                          teamId={teamId}
                          currentUserId={currentUserId}
                          currentUserRole={currentUserRole}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 mb-4"
                  >
                    <Users className="h-10 w-10 text-slate-400" />
                  </motion.div>
                  <p className="text-slate-400 text-lg font-medium">No members yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Leave team button */}
          {currentUserRole !== 'OWNER' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLeaveDialogOpen(true)} // Open Custom Dialog
                disabled={leaveTeamMutation.isPending}
                className="group relative px-6 py-3 rounded-xl overflow-hidden font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl transition-all group-hover:bg-red-500/15 group-hover:border-red-500/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <span className="relative flex items-center gap-2 text-red-400">
                  <LogOut className="h-4 w-4" />
                  {leaveTeamMutation.isPending ? 'Leaving...' : 'Leave Team'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Dialogs */}
        <EditTeamDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} team={team} />
        <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} teamId={teamId} />
        
        {/* Confirm Leave Dialog */}
        <ConfirmDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          title="Leave Team"
          description="Are you sure you want to leave this team? You will lose access to all team projects and data. You can rejoin if you have an invite link."
          confirmLabel="Leave Team"
          variant="danger"
          onConfirm={onConfirmLeaveTeam}
          isLoading={leaveTeamMutation.isPending}
        />
      </div>
    </PremiumBackground>
  );
};