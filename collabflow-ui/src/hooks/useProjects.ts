import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isVersionConflictError } from '../lib/concurrency';
import {
  projectsApi,
} from '../api/projects'
import type {  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../api/projects'

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

    onMutate: async ({ projectId, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });

      const snapshots = queryClient.getQueriesData({ queryKey: projectKeys.all });

      queryClient.setQueryData(projectKeys.byId(projectId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        };
      });

      queryClient.setQueryData(projectKeys.byTeam(teamId), (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((project: any) =>
          project.id === projectId
            ? {
                ...project,
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined ? { description: data.description ?? null } : {}),
              }
            : project
        );
      });

      return { snapshots };
    },

    onError: (error, _variables, context) => {
      if (isVersionConflictError(error)) {
        const latest = error.response?.data?.latest as any;
        if (latest?.id) {
          queryClient.setQueryData(projectKeys.byId(latest.id), latest);
          queryClient.setQueryData(projectKeys.byTeam(teamId), (old: any) => {
            if (!Array.isArray(old)) return old;
            return old.map((project: any) =>
              project.id === latest.id ? latest : project
            );
          });
          return;
        }
      }

      context?.snapshots?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },

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