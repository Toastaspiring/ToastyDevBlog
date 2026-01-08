import { useQuery } from "@tanstack/react-query";
import {
  getUserCreatedPosts,
} from "../endpoints/user/created-posts_GET.client";
import { OutputType as UserCreatedPostsType } from "../endpoints/user/created-posts_GET.schema";

export const USER_CREATED_POSTS_QUERY_KEY = ["user", "created-posts"] as const;

export const useUserCreatedPostsQuery = () => {
  return useQuery<UserCreatedPostsType, Error>({
    queryKey: USER_CREATED_POSTS_QUERY_KEY,
    queryFn: () => getUserCreatedPosts(),
  });
};