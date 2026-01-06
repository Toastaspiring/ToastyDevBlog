import { useQuery } from "@tanstack/react-query";
import {
  getUserLikedPosts,
  UserLikedPost,
} from "../endpoints/user/liked-posts_GET.schema";

export const USER_LIKED_POSTS_QUERY_KEY = ["user", "liked-posts"] as const;

export const useUserLikedPostsQuery = () => {
  return useQuery<UserLikedPost[], Error>({
    queryKey: USER_LIKED_POSTS_QUERY_KEY,
    queryFn: () => getUserLikedPosts(),
  });
};