import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEvent } from "../endpoints/event/delete_DELETE.client";
import { InputType } from "../endpoints/event/delete_DELETE.schema";

export function useDeleteEventMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: InputType) => deleteEvent(input),
        onSuccess: () => {
            // Invalidate events queries to refetch the list
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["nextEvent"] });
        },
    });
}
