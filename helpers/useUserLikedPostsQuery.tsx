import { useQuery } from "@tanstack/react-query";
import {
  getUserLikedPosts,
} from "../endpoints/user/liked-posts_GET.client";
import { OutputType as UserLikedPostsType } from "../endpoints/user/liked-posts_GET.schema";

export const USER_LIKED_POSTS_QUERY_KEY = ["user", "liked-posts"] as const;

export const useUserLikedPostsQuery = () => {
  return useQuery<UserLikedPostsType, Error>({
    queryKey: USER_LIKED_POSTS_QUERY_KEY,
    queryFn: () => getUserLikedPosts(),
  });
};