import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { TeamCard } from '../components/TeamCard';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { CardSkeleton, Button } from '../components/shared';

export const TeamsList: React.FC = () => {
  const navigate = useNavigate();
  const { data: teams, isLoading, error } = useTeams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-700 dark:text-gray-200">Failed to load teams</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Teams</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Manage and collaborate with your teams</p>
          </div>
          <Button size="lg" onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Team
          </Button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : teams && teams.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {teams.map((team) => (
              <motion.div
                key={team.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring', stiffness: 300, damping: 30 },
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No teams yet</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Create your first team to get started</p>
            <Button size="md" onClick={() => setCreateDialogOpen(true)} className="mt-6">
              Create Team
            </Button>
          </motion.div>
        )}
      </div>

      <CreateTeamDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};
