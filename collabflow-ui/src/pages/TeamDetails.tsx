// pages/TeamDetails.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Link2 } from 'lucide-react';
import { useTeamDetails } from '../hooks/useTeams';
import { MemberCard } from '../components/MemberCard';
import { EditTeamDialog } from '../components/EditTeamDialog';
import { InviteDialog } from '../components/InviteDialog';
import { TeamDetailsSkeletons, Button } from '../components/shared';

export const TeamDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading, error } = useTeamDetails(teamId || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  if (!teamId) {
    return <div className="flex items-center justify-center min-h-screen">Invalid team ID</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/teams')} 
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </button>
          <TeamDetailsSkeletons />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-700 dark:text-gray-200">Failed to load team details</p>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    );
  }

  // Since we don't have userRole from backend, you might need to add it
  // For now, let's assume everyone can manage (you'll need to update backend)
  const canManage = true; // TODO: Get this from backend

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/teams')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900 mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                {team.description || 'No description'}
              </p>
            </div>

            {canManage && (
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Team
                </Button>
                <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Invite
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Members ({team.members?.length ?? 0})
          </h2>

          {team.members && team.members.length > 0 ? (
            <div className="space-y-4">
              {team.members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <MemberCard member={member} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No members yet</p>
          )}
        </motion.div>
      </div>

      <EditTeamDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} team={team} />
      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} teamId={teamId} />
    </div>
  );
};