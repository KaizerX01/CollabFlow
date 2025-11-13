import React, { useState, useEffect } from 'react';
import { Modal, Button } from './shared';
import { useUpdateTeam } from '../hooks/useTeams';
import { useToast } from '../hooks/use-toast';
import type { TeamDetails } from '../api/teams';

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamDetails;
}

export const EditTeamDialog: React.FC<EditTeamDialogProps> = ({ open, onOpenChange, team }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: updateTeam, isPending } = useUpdateTeam(team.id);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setName(team.name);
      setDescription(team.description);
    }
  }, [open, team]);

  const handleSubmit = () => {
    if (!name.trim()) {
      showToast('error', 'Team name is required');
      return;
    }

    updateTeam(
      { name, description },
      {
        onSuccess: () => {
          showToast('success', 'Team updated successfully');
          onOpenChange(false);
        },
        onError: (error: any) => {
          showToast('error', error.response?.data?.message || 'Failed to update team');
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Team"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Team Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter team name"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter team description"
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>
    </Modal>
  );
};
