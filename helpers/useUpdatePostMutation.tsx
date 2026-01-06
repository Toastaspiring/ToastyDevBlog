import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InputType, updatePost } from "../endpoints/post/update_PUT.schema";

export const useUpdatePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: InputType) => updatePost(input),
        onSuccess: () => {
            toast.success("Post updated successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post"] }); // Invalidate single post too
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
