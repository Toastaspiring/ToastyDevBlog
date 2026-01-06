import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../endpoints/user/search_GET.schema";

export const useUsersSearchQuery = (query: string) => {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: () => searchUsers(query),
        enabled: query.length > 0,
        staleTime: 1000 * 60, // 1 minute cache
    });
};
