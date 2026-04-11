import api from "./axiosInstance";

export type SearchItemType = "task" | "project" | "activity";

export interface SearchResultItem {
  id: string;
  resourceType: SearchItemType;
  resourceId: string;
  teamId: string;
  projectId: string;
  title: string;
  description: string | null;
  taskListName: string | null;
  actorUsername: string | null;
  priority: number | null;
  completed: boolean | null;
  updatedAt: string | null;
  occurredAt: string | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  items: SearchResultItem[];
}

const searchApi = {
  search: async (params: {
    teamId: string;
    q: string;
    types?: SearchItemType[];
    limit?: number;
  }): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/search", {
      params,
      paramsSerializer: {
        indexes: null,
      },
    });

    return response.data;
  },
};

export default searchApi;
