import React from "react";
import { AlertCircle, Calendar, Info, User } from "lucide-react";
import { useEventsQuery } from "../helpers/useEventsQuery";
import { Skeleton } from "./Skeleton";
import { OutputType as EventsListType } from "../endpoints/events/list_GET.schema";
import styles from "./UpcomingEventsList.module.css";

type Event = EventsListType[0];

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Date(event.eventDate).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{event.title}</h3>
      {event.description && (
        <p className={styles.cardDescription}>{event.description}</p>
      )}
      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
        <div className={styles.metaItem}>
          <User size={14} />
          <span>Created by {event.creatorDisplayName}</span>
        </div>
      </div>
    </div>
  );
};

const EventCardSkeleton: React.FC = () => {
  return (
    <div className={styles.card}>
      <Skeleton style={{ height: "1.5rem", width: "70%" }} />
      <Skeleton style={{ height: "1rem", width: "90%", marginTop: "0.75rem" }} />
      <Skeleton style={{ height: "1rem", width: "80%" }} />
      <div className={styles.cardMeta} style={{ marginTop: "1rem" }}>
        <Skeleton style={{ height: "1rem", width: "50%" }} />
        <Skeleton style={{ height: "1rem", width: "40%" }} />
      </div>
    </div>
  );
};

export const UpcomingEventsList: React.FC = () => {
  const { data: events, isFetching, error } = useEventsQuery();

  if (isFetching) {
    return (
      <div className={styles.listContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.stateMessage} ${styles.error}`}>
        <AlertCircle size={24} />
        <p>Failed to load events. Please try again later.</p>
        <p className={styles.errorMessage}>
          {error instanceof Error ? error.message : "An unknown error occurred."}
        </p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={styles.stateMessage}>
        <Info size={24} />
        <p>There are no upcoming events scheduled.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};