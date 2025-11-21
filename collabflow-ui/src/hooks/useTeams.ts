// hooks/useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamsAPI from '../api/teams';
import type { CreateTeamRequest, UpdateTeamRequest } from '../api/teams';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: teamsAPI.getTeams,
  });
};

export const useTeamDetails = (teamId: string) => {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsAPI.getTeamDetails(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamRequest) => teamsAPI.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTeamRequest) => teamsAPI.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
};

// hooks/useTeams.ts
export const useGenerateInvite = () => {
  return useMutation({
    mutationFn: (teamId: string) => teamsAPI.generateInvite(teamId),
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => teamsAPI.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};



export const useUpdateMemberRole = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) => 
      teamsAPI.updateMemberRole(teamId, userId, newRole),
    onSuccess: () => {
      // Invalidate team details to refresh the member list (which should include the new role)
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
};

/**
 * Hook for transferring team ownership.
 */
export const useTransferOwnership = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOwnerId: string) => 
      teamsAPI.transferOwnership(teamId, newOwnerId),
    onSuccess: () => {
      // Invalidate team details and the teams list (as ownership affects who can see/manage the team)
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

/**
 * Hook for removing a member from a team.
 */
export const useRemoveMember = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => 
      teamsAPI.removeMember(teamId, userId),
    onSuccess: () => {
      // Invalidate team details to refresh the member list
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
};

/**
 * Hook for a user to leave a team.
 */
export const useLeaveTeam = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamsAPI.leaveTeam(teamId),
    onSuccess: () => {
      // Invalidate the list of teams (since the user is no longer a member)
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};