// api/taskLists.ts
import api from "./axiosInstance";

export interface TaskListCreateRequest {
  projectId: string;
  name: string;
  position?: number;
}

export interface TaskListUpdateRequest {
  name?: string;
  position?: number;
}

export interface TaskListResponse {
  id: string;
  projectId: string;
  name: string;
  position: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const taskListsApi = {
  // Get all task lists in a project
  getProjectTaskLists: async (projectId: string): Promise<TaskListResponse[]> => {
    const response = await api.get(`/task-lists/project/${projectId}`);
    return response.data;
  },

  // Get single task list
  getById: async (listId: string): Promise<TaskListResponse> => {
    const response = await api.get(`/task-lists/${listId}`);
    return response.data;
  },

  // Create task list
  create: async (projectId: string, data: TaskListCreateRequest): Promise<TaskListResponse> => {
    const response = await api.post(`/task-lists/project/${projectId}`, data);
    return response.data;
  },

  // Update task list
  update: async (listId: string, data: TaskListUpdateRequest): Promise<TaskListResponse> => {
    const response = await api.put(`/task-lists/${listId}`, data);
    return response.data;
  },

  // Delete task list
  delete: async (listId: string): Promise<void> => {
    await api.delete(`/task-lists/${listId}`);
  },

  // Reorder task lists
  reorder: async (projectId: string, orderedListIds: string[]): Promise<void> => {
    await api.patch(`/task-lists/project/${projectId}/reorder`, orderedListIds);
  },
};