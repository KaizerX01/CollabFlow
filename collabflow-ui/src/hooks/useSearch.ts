import { useQuery } from "@tanstack/react-query";
import searchApi, { type SearchItemType } from "../api/search";

export const useSearch = (
  teamId: string,
  q: string,
  types: SearchItemType[] = ["task", "project", "activity"],
  limit = 15
) => {
  return useQuery({
    queryKey: ["search", teamId, q, types, limit],
    queryFn: () => searchApi.search({ teamId, q, types, limit }),
    enabled: !!teamId && q.trim().length >= 2,
    staleTime: 30_000,
  });
};
