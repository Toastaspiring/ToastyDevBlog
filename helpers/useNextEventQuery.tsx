import { useQuery } from "@tanstack/react-query";
import { getEventNext } from "../endpoints/event/next_GET.client";

export const NEXT_EVENT_QUERY_KEY = ["events", "next"] as const;

export const useNextEventQuery = () => {
  return useQuery({
    queryKey: NEXT_EVENT_QUERY_KEY,
    queryFn: getEventNext,
    // Refetch every 60 seconds to keep any countdowns or time-sensitive UI accurate
    refetchInterval: 60 * 1000,
  });
};