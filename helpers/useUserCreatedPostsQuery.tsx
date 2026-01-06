import { useQuery } from "@tanstack/react-query";
import {
  getUserCreatedPosts,
  UserCreatedPost,
} from "../endpoints/user/created-posts_GET.schema";

export const USER_CREATED_POSTS_QUERY_KEY = ["user", "created-posts"] as const;

export const useUserCreatedPostsQuery = () => {
  return useQuery<UserCreatedPost[], Error>({
    queryKey: USER_CREATED_POSTS_QUERY_KEY,
    queryFn: () => getUserCreatedPosts(),
  });
};