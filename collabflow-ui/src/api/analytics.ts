import api from "./axiosInstance";

export interface UsageEventTypeCount {
  eventType: string;
  count: number;
}

export interface UsageDailyPoint {
  day: string;
  count: number;
}

export interface UsageAnalyticsResponse {
  teamId: string;
  projectId: string | null;
  fromDate: string;
  toDate: string;
  totalEvents: number;
  byEventType: UsageEventTypeCount[];
  daily: UsageDailyPoint[];
}

const analyticsApi = {
  getUsage: async (params: {
    teamId: string;
    projectId?: string;
    days?: number;
  }): Promise<UsageAnalyticsResponse> => {
    const response = await api.get<UsageAnalyticsResponse>("/analytics/usage", {
      params,
    });

    return response.data;
  },
};

export default analyticsApi;
