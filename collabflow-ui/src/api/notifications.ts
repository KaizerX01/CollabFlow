import { api } from './axiosInstance';

export interface InAppNotification {
  id: string;
  eventId: string;
  eventType: string;
  title: string;
  message: string;
  route?: string;
  isRead: boolean;
  createdAt: string;
}

interface UnreadCountResponse {
  unreadCount: number;
}

interface MarkAllReadResponse {
  updated: number;
}

export const notificationsApi = {
  async list(limit = 20): Promise<InAppNotification[]> {
    const response = await api.get<InAppNotification[]>('/notifications', {
      params: { limit },
    });
    return response.data;
  },

  async unreadCount(): Promise<number> {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.unreadCount;
  },

  async markRead(notificationId: string): Promise<InAppNotification> {
    const response = await api.patch<InAppNotification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllRead(): Promise<number> {
    const response = await api.patch<MarkAllReadResponse>('/notifications/read-all');
    return response.data.updated;
  },
};
