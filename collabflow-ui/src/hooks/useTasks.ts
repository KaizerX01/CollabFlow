// hooks/useTasks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import type {
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskMoveRequest,
  TaskResponse,
} from '../api/tasks';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  byTaskList: (taskListId: string) => [...taskKeys.all, 'list', taskListId] as const,
  byProject: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  byId: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
};

// Get tasks by task list
export const useTaskListTasks = (taskListId: string) => {
  return useQuery({
    queryKey: taskKeys.byTaskList(taskListId),
    queryFn: () => tasksApi.getTaskListTasks(taskListId),
    enabled: !!taskListId,
  });
};

// Get all tasks in a project
export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => tasksApi.getProjectTasks(projectId),
    enabled: !!projectId,
  });
};

// Get task by ID
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.byId(taskId),
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  });
};

// Create task
export const useCreateTask = (taskListId: string, projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(taskListId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byTaskList(taskListId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    },
  });
};

// Update task
export const useUpdateTask = (projectId: string, taskListId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskUpdateRequest }) =>
      tasksApi.update(taskId, data),
    onSuccess: (updatedTask) => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.byTaskList(updatedTask.taskListId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byId(updatedTask.id) });
      if (taskListId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.byTaskList(taskListId) });
      }
    },
  });
};

// Move task
export const useMoveTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskMoveRequest }) =>
      tasksApi.move(taskId, data),

    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const snapshots = queryClient.getQueriesData({
        queryKey: taskKeys.all,
      });

      queryClient.setQueriesData<TaskResponse[]>(
        { queryKey: taskKeys.all },
        (old) => {
          if (!old) return old;

          return old.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  taskListId: data.newTaskListId,
                  position: data.newPosition,
                }
              : task
          );
        }
      );

      return { snapshots };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};


// Toggle task completion
export const useToggleTaskComplete = (projectId: string, taskListId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.toggleComplete(taskId),
    onSuccess: async (updatedTask) => {
      // Immediately update cache with the returned task
      queryClient.setQueryData<TaskResponse>(
        taskKeys.byId(updatedTask.id),
        updatedTask
      );

      // Update the task in list queries
      queryClient.setQueriesData<TaskResponse[]>(
        { queryKey: taskKeys.byTaskList(updatedTask.taskListId) },
        (old) => {
          if (!old) return old;
          return old.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );

      queryClient.setQueriesData<TaskResponse[]>(
        { queryKey: taskKeys.byProject(projectId) },
        (old) => {
          if (!old) return old;
          return old.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );

      // Then refetch to ensure consistency
      await queryClient.refetchQueries({ 
        queryKey: taskKeys.byTaskList(updatedTask.taskListId),
        type: 'active'
      });
    },
  });
};


// Delete task
export const useDeleteTask = (projectId: string, taskListId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
      if (taskListId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.byTaskList(taskListId) });
      }
    },
  });
};

// Optimistic update helper for drag and drop
export const useOptimisticTaskMove = () => {
  const queryClient = useQueryClient();

  return {
    onMutate: async ({ taskId, data }: { taskId: string; data: TaskMoveRequest }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

      // Optimistically update to the new value
      queryClient.setQueriesData<TaskResponse[]>(
        { queryKey: taskKeys.all },
        (old) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === taskId
              ? { ...task, taskListId: data.newTaskListId, position: data.newPosition }
              : task
          );
        }
      );

      return { previousTasks };
    },
    onError: (_err: any, _variables: any, context: any) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  };
};