// api/teams.ts
import { api as apiClient } from "./axiosInstance";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TeamDetails extends Team {
  members: TeamMember[];
}

// api/teams.ts
export interface InviteLink {
  inviteLink: string;  // ✅ Match your backend response
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name: string;
  description: string;
}

const teamsAPI = {
  getTeams: async (): Promise<Team[]> => {
    const { data } = await apiClient.get<Team[]>('/teams');  // ✅ Plural
    return data;
  },

  getTeamById: async (teamId: string): Promise<Team> => {
    const { data } = await apiClient.get<Team>(`/teams/${teamId}`);  // ✅ Plural
    return data;
  },

  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    const { data } = await apiClient.get<TeamMember[]>(`/teams/${teamId}/members`);  // ✅ Plural
    return data;
  },

  // Fetch both team and members together
  getTeamDetails: async (teamId: string): Promise<TeamDetails> => {
    const [team, members] = await Promise.all([
      apiClient.get<Team>(`/teams/${teamId}`),  // ✅ Plural
      apiClient.get<TeamMember[]>(`/teams/${teamId}/members`)  // ✅ Plural
    ]);

    return {
      ...team.data,
      members: members.data
    };
  },

  createTeam: async (payload: CreateTeamRequest): Promise<Team> => {
    const { data } = await apiClient.post<Team>('/teams', payload);  // ✅ Plural
    return data;
  },

  updateTeam: async (teamId: string, payload: UpdateTeamRequest): Promise<Team> => {
    const { data } = await apiClient.patch<Team>(`/teams/${teamId}`, payload);  // ✅ Plural
    return data;
  },

  generateInvite: async (teamId: string): Promise<InviteLink> => {
    const { data } = await apiClient.post<InviteLink>(`/teams/${teamId}/invite`);  // ✅ Plural
    return data;
  },

  acceptInvite: async (token: string): Promise<Team> => {
    const { data } = await apiClient.post<Team>(`/teams/join/${token}`);  // ✅ Plural
    return data;
  },
};

export default teamsAPI;