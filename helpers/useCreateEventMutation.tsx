import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InputType } from "../endpoints/event/create_POST.schema";
import { postEventCreate } from "../endpoints/event/create_POST.client";
import { NEXT_EVENT_QUERY_KEY } from "./useNextEventQuery";
import { EVENTS_QUERY_KEY } from "./useEventsQuery";

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEvent: InputType) => postEventCreate(newEvent),
    onSuccess: () => {
      // Invalidate both the next event and events list queries
      queryClient.invalidateQueries({ queryKey: NEXT_EVENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });
};