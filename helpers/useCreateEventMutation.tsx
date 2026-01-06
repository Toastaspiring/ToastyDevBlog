import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postEventCreate,
  InputType,
} from "../endpoints/event/create_POST.schema";
import { NEXT_EVENT_QUERY_KEY } from "./useNextEventQuery";

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEvent: InputType) => postEventCreate(newEvent),
    onSuccess: () => {
      // Invalidate the next event query to refetch and show the new event if it's the soonest
      queryClient.invalidateQueries({ queryKey: NEXT_EVENT_QUERY_KEY });
    },
  });
};