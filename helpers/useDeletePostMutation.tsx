import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InputType, deletePost } from "../endpoints/post/delete_DELETE.schema";

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: InputType) => deletePost(input),
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
