import { useQuery } from "@tanstack/react-query";
import { PostWithCounts } from "../endpoints/posts_GET.schema";
import { getPosts } from "../endpoints/posts_GET.client";


import { InputType } from "../endpoints/posts_GET.schema";

export const POSTS_QUERY_KEY = ["posts"] as const;

export const usePostsQuery = (options?: InputType) => {
  return useQuery<PostWithCounts[], Error>({
    queryKey: [...POSTS_QUERY_KEY, options],
    queryFn: () => getPosts(options),
  });
};