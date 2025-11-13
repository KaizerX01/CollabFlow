import React, { useState } from 'react';
import { Modal, Button } from './shared';
import { useCreateTeam } from '../hooks/useTeams';
import { useToast } from '../hooks/use-toast';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createTeam, isPending } = useCreateTeam();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      showToast('error', 'Team name is required');
      return;
    }

    createTeam(
      { name, description },
      {
        onSuccess: () => {
          showToast('success', 'Team created successfully');
          setName('');
          setDescription('');
          onOpenChange(false);
        },
        onError: (error: any) => {
          showToast('error', error.response?.data?.message || 'Failed to create team');
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName('');
      setDescription('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Team"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Create Team
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Team Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter team name"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            id="description"
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
