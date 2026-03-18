import { api as apiClient } from "./axiosInstance";

export interface DashboardData {
  teams: TeamSummary[];
  assignedTasks: TaskSummary[];
  recentActivity: ActivitySummary[];
  stats: DashboardStats;
}

export interface TeamSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  description: string;
  priority: number;
  dueDate: string | null;
  completed: boolean;
  projectName: string;
  projectId: string;
  teamName: string;
  teamId: string;
  taskListName: string;
}

export interface ActivitySummary {
  id: string;
  message: string;
  eventType: string;
  actorUsername: string;
  occurredAt: string;
}

export interface DashboardStats {
  totalTeams: number;
  totalAssignedTasks: number;
  overdueTasks: number;
  completedTasksThisWeek: number;
}

const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get<DashboardData>("/dashboard");
    return data;
  },
};

export default dashboardApi;
