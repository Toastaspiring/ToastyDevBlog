import { useQuery } from "@tanstack/react-query";
import {
  getUserComments,
  UserComment,
} from "../endpoints/user/comments_GET.schema";

export const USER_COMMENTS_QUERY_KEY = ["user", "comments"] as const;

export const useUserCommentsQuery = (userId?: number) => {
  return useQuery<UserComment[], Error>({
    queryKey: ["user", "comments", userId],
    queryFn: () => getUserComments(userId ? { userId } : undefined),
    enabled: true,
  });
};