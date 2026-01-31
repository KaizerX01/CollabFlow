// api/tasks.ts
import api from "./axiosInstance";

export interface TaskAssignmentResponse {
  userId: string;
  username: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  position?: number;
  priority?: number;
  dueDate?: string;
  assigneeIds?: string[];
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  position?: number;
  priority?: number;
  dueDate?: string;
  isCompleted?: boolean;
  assigneeIds?: string[];
}

export interface TaskMoveRequest {
  newTaskListId: string;
  newPosition: number;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  taskListId: string;
  title: string;
  description: string | null;
  position: number;
  priority: number;
  dueDate: string | null;
  completed: boolean;  // Backend sends "isCompleted" but Jackson/Lombok converts to "completed"
  isCompleted: boolean; // Keep both for compatibility
  isDeleted: boolean;
  deleted: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignees: TaskAssignmentResponse[];
}

export const tasksApi = {
  // Get all tasks in a task list
  getTaskListTasks: async (taskListId: string): Promise<TaskResponse[]> => {
    const response = await api.get(`/tasks/task-list/${taskListId}`);
    return response.data;
  },

  // Get all tasks in a project (flat list)
  getProjectTasks: async (projectId: string): Promise<TaskResponse[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Get single task
  getById: async (taskId: string): Promise<TaskResponse> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Create task
  create: async (taskListId: string, data: TaskCreateRequest): Promise<TaskResponse> => {
    const response = await api.post(`/tasks/task-list/${taskListId}`, data);
    return response.data;
  },

  // Update task
  update: async (taskId: string, data: TaskUpdateRequest): Promise<TaskResponse> => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  // Move task to different list/position
  move: async (taskId: string, data: TaskMoveRequest): Promise<TaskResponse> => {
    const response = await api.patch(`/tasks/${taskId}/move`, data);
    return response.data;
  },

  // Toggle completion
  toggleComplete: async (taskId: string): Promise<TaskResponse> => {
    const response = await api.patch(`/tasks/${taskId}/toggle-complete`);
    return response.data;
  },

  // Delete task (soft delete)
  delete: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};