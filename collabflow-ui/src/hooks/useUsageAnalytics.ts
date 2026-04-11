import { useQuery } from "@tanstack/react-query";
import analyticsApi from "../api/analytics";

export const useUsageAnalytics = (teamId: string, days = 30, projectId?: string) => {
  return useQuery({
    queryKey: ["usage-analytics", teamId, days, projectId],
    queryFn: () => analyticsApi.getUsage({ teamId, days, projectId }),
    enabled: !!teamId,
    staleTime: 60_000,
  });
};
