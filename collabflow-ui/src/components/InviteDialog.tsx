import React, { useState, useEffect } from 'react';
import { Copy, Check, Link2, Sparkles, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button } from './shared';
import { useGenerateInvite } from '../hooks/useTeams';
import { useToast } from '../hooks/use-toast';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({ 
  open, 
  onOpenChange, 
  teamId 
}) => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutate: generateInvite, isPending } = useGenerateInvite();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) {
      setInviteLink(null);
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && !inviteLink && teamId && teamId !== 'undefined') {
      console.log('🔗 Generating invite for team:', teamId);
      
      generateInvite(teamId, {
        onSuccess: (data) => {
          console.log('✅ Invite generated:', data);
          setInviteLink(data.inviteLink);
          showToast('success', 'Invite link generated');
        },
        onError: (error: any) => {
          console.error('❌ Failed to generate invite:', error);
          showToast('error', error.response?.data?.message || 'Failed to generate invite link');
          onOpenChange(false);
        },
      });
    }
  }, [open, inviteLink, teamId, generateInvite, showToast, onOpenChange]);

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showToast('success', 'Invite link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 dark:border-purple-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Team Invite Link
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Share access with your team members
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
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleCopy} 
              disabled={!inviteLink || isPending}
              isLoading={isPending}
              className="relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </motion.span>
                  )}
                </AnimatePresence>
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
        {/* Description with icon */}
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-blue-500/10 dark:border-purple-500/10"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          </motion.div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Share this link with others to invite them to join your team. Anyone with the link can request access.
          </p>
        </motion.div>
        
        {/* Invite Link Display */}
        <motion.div
          className="relative group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"
          />
          
          {/* Link container */}
          <div className="relative rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 p-5 backdrop-blur-xl overflow-hidden">
            {/* Animated mesh gradient background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Content */}
            <div className="relative">
              {inviteLink ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="break-all font-mono text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {inviteLink}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Skeleton loader with shimmer effect */}
                  {[1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="relative h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg overflow-hidden"
                      style={{ width: i === 2 ? '75%' : '100%' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    className="flex items-center gap-2 pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Generating your invite link...
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Info footer */}
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            This link allows anyone with it to join your team. Share it only with trusted members.
          </p>
        </motion.div>
      </motion.div>
    </Modal>
  );
};