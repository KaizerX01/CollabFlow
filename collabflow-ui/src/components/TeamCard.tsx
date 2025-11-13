import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from './shared';
import type { Team } from '../api/teams';

interface TeamCardProps {
  team: Team;
  onViewDetails: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onViewDetails }) => {
  return (
    <Card hover>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{team.description}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <Badge variant={team.userRole}>{team.userRole}</Badge>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <span className="flex items-center gap-2">
              View Details
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
