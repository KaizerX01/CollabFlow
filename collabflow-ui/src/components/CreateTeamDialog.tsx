import React, { useState } from 'react';
import { Plus, Sparkles, FileText, AlignLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
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
      title={
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 dark:border-blue-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Team
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Start building your dream team
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
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
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
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Create Team
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
        {/* Welcome banner */}
        <motion.div
          className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 60%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="relative flex items-start gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            </motion.div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                Build Something Amazing
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Create a new Create a new team to collaborate with others and achieve your goals together.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team Name Input */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label 
            htmlFor="name" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3"
          >
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 opacity-0 blur-lg transition-opacity duration-300"
              animate={{ opacity: focusedField === 'name' ? 0.3 : 0 }}
            />
            
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter team name"
              className="relative w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500/50 dark:focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-blue-500/10 transition-all duration-200 font-medium"
            />
          </motion.div>
        </motion.div>

        {/* Description Textarea */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <label 
            htmlFor="description" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3"
          >
            <AlignLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Description
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
          </label>
          
          <motion.div
            className="relative group"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Animated border glow on focus */}
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 opacity-0 blur-lg transition-opacity duration-300"
              animate={{ opacity: focusedField === 'description' ? 0.3 : 0 }}
            />
            
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              placeholder="Describe your team's purpose and goals..."
              rows={4}
              className="relative w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500/50 dark:focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-blue-500/10 transition-all duration-200 resize-none font-medium leading-relaxed"
            />
          </motion.div>
          
          {/* Character count */}
          <motion.div
            className="flex justify-between items-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Help others understand your team's mission
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {description.length} characters
            </span>
          </motion.div>
        </motion.div>

        {/* Tips card */}
        <motion.div
          className="relative p-4 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-blue-500/10 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Subtle animated background */}
          <motion.div
            className="absolute inset-0 opacity-50"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </motion.div>
              <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Pro Tips
              </h5>
            </div>
            <ul className="space-y-1.5 ml-7">
              <li className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Choose a clear, memorable name for your team</span>
              </li>
              <li className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Add a description to help members understand the team's purpose</span>
              </li>
              <li className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span>You can invite members and customize settings after creation</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </Modal>
  );
};