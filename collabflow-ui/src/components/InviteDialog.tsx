import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
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
          setInviteLink(data.inviteLink);  // ✅ Only use inviteLink
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
      title="Team Invite Link"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button 
            onClick={handleCopy} 
            disabled={!inviteLink || isPending}
            isLoading={isPending}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Share this link with others to invite them to join your team.
        </p>
        
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
          {inviteLink ? (
            <p className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">
              {inviteLink}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse w-3/4" />
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This link allows anyone with it to join your team.
        </p>
      </div>
    </Modal>
  );
};