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