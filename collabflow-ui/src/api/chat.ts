import api from './axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessageResponse {
  id: string;
  projectId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  content: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const chatApi = {
  /**
   * Fetch the latest messages for a project chat.
   * Returns messages in chronological order (oldest → newest).
   */
  getMessages: async (
    projectId: string,
    limit: number = 20
  ): Promise<ChatMessageResponse[]> => {
    const response = await api.get<ChatMessageResponse[]>(
      `/chat/project/${projectId}/messages`,
      { params: { limit } }
    );
    return response.data;
  },
};
