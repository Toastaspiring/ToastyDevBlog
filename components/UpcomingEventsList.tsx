import React, { useState } from "react";
import { AlertCircle, Calendar, Info, User, Trash2, CheckCircle2 } from "lucide-react";
import { useEventsQuery } from "../helpers/useEventsQuery";
import { useDeleteEventMutation } from "../helpers/useDeleteEventMutation";
import { Skeleton } from "./Skeleton";
import { OutputType as EventsListType } from "../endpoints/events/list_GET.schema";
import styles from "./UpcomingEventsList.module.css";
import { toast } from "sonner";
import { useAuth } from "../helpers/useAuth";

type Event = EventsListType[0];

const EventCard: React.FC<{ event: Event; isAdmin: boolean }> = ({ event, isAdmin }) => {
  const deleteEventMutation = useDeleteEventMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(event.eventDate).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setIsDeleting(true);
      deleteEventMutation.mutate(
        { id: event.id },
        {
          onSuccess: () => {
            toast.success("Event Deleted", {
              description: "The event has been removed successfully.",
              icon: <CheckCircle2 size={16} />,
            });
          },
          onError: (error) => {
            setIsDeleting(false);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred.";
            toast.error("Deletion Failed", {
              description: errorMessage,
              icon: <AlertCircle size={16} />,
            });
          },
        }
      );
    }
  };

  return (
    <div className={`${styles.card} ${isDeleting ? styles.cardDeleting : ''}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        {isAdmin && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={deleteEventMutation.isPending || isDeleting}
            aria-label="Delete event"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
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
  const { authState } = useAuth();

  const isAdmin = authState.type === "authenticated" && authState.user.role === "admin";

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
        <EventCard key={event.id} event={event} isAdmin={!!isAdmin} />
      ))}
    </div>
  );
};