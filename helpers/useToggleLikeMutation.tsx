import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postPostLike,
  InputType,
} from "../endpoints/post/like_POST.schema";
import { POSTS_QUERY_KEY } from "./usePostsQuery";

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likeData: InputType) => postPostLike(likeData),
    onSuccess: () => {
      // Invalidate the posts query to update the like counts on the posts list
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });

      // A more granular invalidation for a specific post's page would be:
      // queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};