import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, UserX, UserPlus, Zap, Sparkles, Crown, Shield, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Badge, Button } from './shared';
import { ConfirmDialog } from './ConfirmDialog'; // Ensure this path is correct
import type { TeamMember } from '../api/teams';
import { useRemoveMember, useUpdateMemberRole, useTransferOwnership } from '../hooks/useTeams';
import { createPortal } from 'react-dom';

interface MemberCardProps {
  member: TeamMember;
  teamId: string;
  currentUserId: string | null;
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// Dropdown MenuItem Component (unchanged)
interface DropdownMenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  children: React.ReactNode;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  className = '', 
  icon, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/50',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/30',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/30',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ x: 4, scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        w-full text-left px-4 py-2.5 text-sm font-medium
        transition-all duration-200 flex items-center gap-3
        rounded-lg mx-1 my-0.5
        ${variantStyles[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </motion.button>
  );
};

// Role Icon Component (unchanged)
const RoleIcon: React.FC<{ role: 'OWNER' | 'ADMIN' | 'MEMBER' }> = ({ role }) => {
  const iconMap = {
    OWNER: <Crown className="h-3.5 w-3.5" />,
    ADMIN: <Shield className="h-3.5 w-3.5" />,
    MEMBER: <UserIcon className="h-3.5 w-3.5" />,
  };
  return iconMap[role];
};

// Define the types for our confirmation dialog state
type ConfirmationType = 'REMOVE' | 'CHANGE_ROLE' | 'TRANSFER_OWNER';
interface ConfirmationState {
  isOpen: boolean;
  type: ConfirmationType | null;
  payload?: any;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  teamId,
  currentUserId,
  currentUserRole,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // State to manage the single ConfirmDialog
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: null
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hooks for mutations
  const removeMemberMutation = useRemoveMember(teamId);
  const updateRoleMutation = useUpdateMemberRole(teamId);
  const transferOwnershipMutation = useTransferOwnership(teamId);

  // ... (Effect hooks for positioning and clicking outside remain unchanged) ...
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 256, 
      });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCurrentUser = member.id === currentUserId;
  const isMemberOwner = member.role === 'OWNER';
  const canManageMember = currentUserRole === 'OWNER' && member.id !== currentUserId;
  const canChangeRole = currentUserRole === 'OWNER' && !isMemberOwner && !isCurrentUser;
  const canTransferOwner = currentUserRole === 'OWNER' && !isCurrentUser;

  // --- REFACTORED HANDLERS ---
  
  const handleRemoveClick = () => {
    setIsDropdownOpen(false);
    setConfirmation({
      isOpen: true,
      type: 'REMOVE'
    });
  };

  const handleRoleUpdateClick = (newRole: 'ADMIN' | 'MEMBER') => {
    setIsDropdownOpen(false);
    setConfirmation({
      isOpen: true,
      type: 'CHANGE_ROLE',
      payload: newRole
    });
  };

  const handleTransferOwnershipClick = () => {
    setIsDropdownOpen(false);
    setConfirmation({
      isOpen: true,
      type: 'TRANSFER_OWNER'
    });
  };

  // --- DYNAMIC DIALOG CONFIGURATION ---
  
  // This function returns the props for the dialog based on the current action type
  const getDialogConfig = () => {
    switch (confirmation.type) {
      case 'REMOVE':
        return {
          title: 'Remove Member',
          description: `Are you sure you want to remove ${member.username} from the team? They will lose access immediately.`,
          variant: 'danger' as const,
          confirmLabel: 'Remove User',
          onConfirm: () => removeMemberMutation.mutate(member.id, {
            onError: (err) => console.error('Remove Member Failed:', err),
          }),
          isLoading: removeMemberMutation.isPending
        };
      case 'CHANGE_ROLE':
        const newRole = confirmation.payload;
        const isPromoting = newRole === 'ADMIN';
        return {
          title: isPromoting ? 'Promote to Admin' : 'Demote to Member',
          description: isPromoting 
            ? `Are you sure you want to promote ${member.username}? They will be able to manage other members.`
            : `Are you sure you want to demote ${member.username}? They will lose administrative privileges.`,
          variant: isPromoting ? 'info' as const : 'warning' as const,
          confirmLabel: isPromoting ? 'Promote' : 'Demote',
          onConfirm: () => updateRoleMutation.mutate(
            { userId: member.id, newRole },
            { onError: (err) => console.error('Role Update Failed:', err) }
          ),
          isLoading: updateRoleMutation.isPending
        };
      case 'TRANSFER_OWNER':
        return {
          title: 'Transfer Ownership',
          description: `WARNING: Are you sure you want to transfer ownership to ${member.username}? You will become a regular Admin and lose Owner privileges. This action cannot be undone.`,
          variant: 'danger' as const,
          confirmLabel: 'Transfer Ownership',
          onConfirm: () => transferOwnershipMutation.mutate(member.id, {
            onError: (err) => console.error('Ownership Transfer Failed:', err),
          }),
          isLoading: transferOwnershipMutation.isPending
        };
      default:
        return {
          title: '',
          description: '',
          variant: 'info' as const,
          onConfirm: () => {},
          isLoading: false
        };
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* ... (Visual card structure remains unchanged) ... */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 blur-xl transition-opacity duration-500"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      <motion.div
        className="relative flex items-center justify-between rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 overflow-hidden"
        whileHover={{
          y: -2,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Left section: Avatar + Info */}
        <div className="flex items-center gap-4 relative z-10">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {isMemberOwner && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 blur-md"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <div className="relative">
              <Avatar name={member.username} avatar={member.avatar} size="md" />
              {isMemberOwner && (
                <motion.div
                  className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-1 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Crown className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 dark:text-white truncate text-base">
                {member.username}
              </h4>
              {isCurrentUser && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20"
                >
                  <Sparkles className="h-3 w-3" />
                  You
                </motion.span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate font-medium">
              {member.email}
            </p>
          </div>
        </div>

        {/* Right section: Badge + Actions */}
        <div className="flex items-center gap-3 relative z-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Badge variant={member.role}>
              <span className="flex items-center gap-1.5">
                <RoleIcon role={member.role} />
                <span className="font-semibold">{member.role}</span>
              </span>
            </Badge>
          </motion.div>

          {canManageMember && (
            <div className="relative">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  ref={buttonRef}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 backdrop-blur-sm"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                </Button>
              </motion.div>

              {isDropdownOpen && createPortal(
                <AnimatePresence>
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{
                      position: 'fixed',
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      zIndex: 9999,
                    }}
                    className="w-64 origin-top-right rounded-2xl bg-white/98 dark:bg-slate-800/98 backdrop-blur-2xl shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 focus:outline-none overflow-hidden"
                  >
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50" />
                    
                    <div className="relative">
                      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Member Actions
                        </p>
                      </div>

                      <div className="py-2">
                        {canChangeRole && member.role === 'MEMBER' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdateClick('ADMIN')}
                            icon={<UserPlus className="h-4 w-4" />}
                            variant="success"
                          >
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {canChangeRole && member.role === 'ADMIN' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdateClick('MEMBER')}
                            icon={<UserX className="h-4 w-4" />}
                            variant="warning"
                          >
                            Demote to Member
                          </DropdownMenuItem>
                        )}

                        {canTransferOwner && (
                          <>
                            {canChangeRole && <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-2 mx-3" />}
                            <DropdownMenuItem
                              onClick={handleTransferOwnershipClick}
                              icon={<Zap className="h-4 w-4" />}
                              variant="warning"
                            >
                              Transfer Ownership
                            </DropdownMenuItem>
                          </>
                        )}

                        {canManageMember && !isMemberOwner && (
                          <>
                            <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-2 mx-3" />
                            <DropdownMenuItem
                              onClick={handleRemoveClick}
                              disabled={removeMemberMutation.isPending}
                              icon={<UserX className="h-4 w-4" />}
                              variant="danger"
                            >
                              {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </div>

                      <div className="h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
                    </div>
                  </motion.div>
                </AnimatePresence>,
                document.body
              )}
            </div>
          )}
        </div>

        {/* Loading overlay for inline mutations (optional backup, but dialog handles this now) */}
        <AnimatePresence>
          {(removeMemberMutation.isPending ||
            updateRoleMutation.isPending ||
            transferOwnershipMutation.isPending) && !confirmation.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-8 w-8 rounded-full border-3 border-blue-500/30 border-t-blue-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Unified Confirmation Dialog */}
      <ConfirmDialog 
        open={confirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmation(prev => ({ ...prev, isOpen: false }));
        }}
        title={dialogConfig.title}
        description={dialogConfig.description}
        variant={dialogConfig.variant}
        confirmLabel={dialogConfig.confirmLabel}
        onConfirm={dialogConfig.onConfirm}
        isLoading={dialogConfig.isLoading}
      />
    </motion.div>
  );
};