import { useQuery } from "@tanstack/react-query";
import { getEventNext } from "../endpoints/event/next_GET.client";

export const NEXT_EVENT_QUERY_KEY = ["events", "next"] as const;

export const useNextEventQuery = () => {
  return useQuery({
    queryKey: NEXT_EVENT_QUERY_KEY,
    queryFn: getEventNext,
    // Only refetch on user actions (mount, window focus, manual refetch)
    // No automatic polling
  });
};