import { useQuery } from "@tanstack/react-query";
import { getEventsList } from "../endpoints/events/list_GET.client";

export const EVENTS_LIST_QUERY_KEY = ["events", "list"] as const;

export const useEventsQuery = () => {
  return useQuery({
    queryKey: EVENTS_LIST_QUERY_KEY,
    queryFn: getEventsList,
    // Refetch every 60 seconds to keep the list of upcoming events fresh.
    refetchInterval: 60 * 1000,
  });
};