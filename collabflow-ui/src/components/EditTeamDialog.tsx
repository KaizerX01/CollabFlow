import React, { useState, useEffect } from 'react';
import { Pencil, Sparkles, FileText, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
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
      title={
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 dark:border-pink-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Pencil className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Team
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Update your team information
            </p>
          </div>
        </motion.div>
      }
      footer={
        <motion.div 
          className="flex gap-3 justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSubmit} 
              isLoading={isPending}
              className="relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Save Changes
              </span>
            </Button>
          </motion.div>
        </motion.div>
      }
    >
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Team Name Input */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <label 
            htmlFor="edit-name" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3"
          >
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Team Name
            <span className="text-red-500">*</span>
          </label>
          
          <motion.div
            className="relative group"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Animated border glow on focus */}
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-lg transition-opacity duration-300"
              animate={{ opacity: focusedField === 'name' ? 0.3 : 0 }}
            />
            
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter team name"
              className="relative w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500/50 dark:focus:border-pink-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-pink-500/10 transition-all duration-200 font-medium"
            />
          </motion.div>
        </motion.div>

        {/* Description Textarea */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label 
            htmlFor="edit-description" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3"
          >
            <AlignLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Description
          </label>
          
          <motion.div
            className="relative group"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Animated border glow on focus */}
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-lg transition-opacity duration-300"
              animate={{ opacity: focusedField === 'description' ? 0.3 : 0 }}
            />
            
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              placeholder="Describe your team's purpose and goals..."
              rows={4}
              className="relative w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500/50 dark:focus:border-pink-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-pink-500/10 transition-all duration-200 resize-none font-medium leading-relaxed"
            />
          </motion.div>
          
          {/* Character count */}
          <motion.div
            className="flex justify-end mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {description.length} characters
            </span>
          </motion.div>
        </motion.div>

        {/* Info card */}
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 border border-purple-500/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </motion.div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Changes will be visible to all team members immediately after saving.
          </p>
        </motion.div>
      </motion.div>
    </Modal>
  );
};