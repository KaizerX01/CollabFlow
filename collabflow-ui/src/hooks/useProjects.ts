import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  projectsApi,
} from '../api/projects'
import type {  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectResponse,} from '../api/projects'

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  byTeam: (teamId: string) => [...projectKeys.all, 'team', teamId] as const,
  byId: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
};

// Get projects by team
export const useTeamProjects = (teamId: string) => {
  return useQuery({
    queryKey: projectKeys.byTeam(teamId),
    queryFn: () => projectsApi.getByTeam(teamId),
    enabled: !!teamId,
  });
};

// Get project by ID
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.byId(projectId),
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId,
  });
};

// Create project
export const useCreateProject = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byTeam(teamId) });
    },
  });
};

// Update project
export const useUpdateProject = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectUpdateRequest }) =>
      projectsApi.update(projectId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byTeam(teamId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.byId(data.id) });
    },
  });
};

// Delete project
export const useDeleteProject = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byTeam(teamId) });
    },
  });
};