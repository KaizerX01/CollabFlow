import api from "./axiosInstance";// Your custom axios instance

export interface ProjectCreateRequest {
  teamId: string;
  name: string;
  description?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const projectsApi = {
  // Create project
  create: async (data: ProjectCreateRequest): Promise<ProjectResponse> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Get project by ID
  getById: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Get all projects for a team
  getByTeam: async (teamId: string): Promise<ProjectResponse[]> => {
    const response = await api.get(`/projects/team/${teamId}`);
    return response.data;
  },

  // Update project
  update: async (
    projectId: string,
    data: ProjectUpdateRequest
  ): Promise<ProjectResponse> => {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  },

  // Delete project
  delete: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
};