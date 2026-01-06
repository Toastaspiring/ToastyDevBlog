import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postPostComment,
  InputType,
} from "../endpoints/post/comment_POST.schema";
import { POSTS_QUERY_KEY } from "./usePostsQuery";

export const useCreateCommentMutation = (slug?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newComment: InputType) => postPostComment(newComment),
    onSuccess: (data, variables) => {
      // Invalidate queries related to the specific post's comments
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ["post", slug] });
      }
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
};