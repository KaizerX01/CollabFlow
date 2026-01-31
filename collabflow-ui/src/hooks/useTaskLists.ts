// hooks/useTaskLists.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskListsApi } from '../api/tasklists';
import type {
  TaskListCreateRequest,
  TaskListUpdateRequest,
  TaskListResponse,
} from '../api/tasklists';
import { taskKeys } from './useTasks';

// Query keys
export const taskListKeys = {
  all: ['taskLists'] as const,
  byProject: (projectId: string) => [...taskListKeys.all, 'project', projectId] as const,
  byId: (listId: string) => [...taskListKeys.all, 'detail', listId] as const,
};

// Get task lists by project
export const useProjectTaskLists = (projectId: string) => {
  return useQuery({
    queryKey: taskListKeys.byProject(projectId),
    queryFn: () => taskListsApi.getProjectTaskLists(projectId),
    enabled: !!projectId,
  });
};

// Get task list by ID
export const useTaskList = (listId: string) => {
  return useQuery({
    queryKey: taskListKeys.byId(listId),
    queryFn: () => taskListsApi.getById(listId),
    enabled: !!listId,
  });
};

// Create task list
export const useCreateTaskList = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskListCreateRequest) => taskListsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskListKeys.byProject(projectId) });
    },
  });
};

// Update task list
export const useUpdateTaskList = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: TaskListUpdateRequest }) =>
      taskListsApi.update(listId, data),
    onSuccess: (updatedList) => {
      queryClient.invalidateQueries({ queryKey: taskListKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: taskListKeys.byId(updatedList.id) });
    },
  });
};

// Delete task list
export const useDeleteTaskList = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => taskListsApi.delete(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskListKeys.byProject(projectId) });
      // Also invalidate all tasks since deleting a list affects tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    },
  });
};

// Reorder task lists
export const useReorderTaskLists = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedListIds: string[]) => taskListsApi.reorder(projectId, orderedListIds),
    onMutate: async (orderedListIds) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskListKeys.byProject(projectId) });

      // Snapshot previous value
      const previousLists = queryClient.getQueryData<TaskListResponse[]>(
        taskListKeys.byProject(projectId)
      );

      // Optimistically update
      if (previousLists) {
        const reorderedLists = orderedListIds
          .map((id) => previousLists.find((list) => list.id === id))
          .filter(Boolean) as TaskListResponse[];

        queryClient.setQueryData(taskListKeys.byProject(projectId), reorderedLists);
      }

      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        queryClient.setQueryData(taskListKeys.byProject(projectId), context.previousLists);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskListKeys.byProject(projectId) });
    },
  });
};