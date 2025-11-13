import React from 'react';
import { Avatar, Badge } from './shared';
import type { TeamMember } from '../api/teams';

interface MemberCardProps {
  member: TeamMember;
}

const getInitials = (username: string) => {
  return username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar 
          name={member.username} 
          avatar={member.avatar} 
          size="md" 
        />
        <div className="min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {member.username}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {member.email}
          </p>
        </div>
      </div>
    </div>
  );
};