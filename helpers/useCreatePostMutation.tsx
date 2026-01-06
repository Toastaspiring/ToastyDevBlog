import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postPostCreate,
  InputType,
} from "../endpoints/post/create_POST.schema";
import { POSTS_QUERY_KEY } from "./usePostsQuery";

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: InputType) => postPostCreate(newPost),
    onSuccess: () => {
      // Invalidate the posts query to refetch the list with the new post
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
};