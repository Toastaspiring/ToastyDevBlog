import React from "react";
import { Helmet } from "react-helmet";
import { EventManagement } from "../components/EventManagement";
import { UpcomingEventsList } from "../components/UpcomingEventsList";
import styles from "./admin.events.module.css";

const AdminEventsPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null); // Type 'any' for now, ideally 'Event'

  return (
    <>
      <Helmet>
        <title>Event Management - Admin</title>
        <meta name="description" content="Create and manage upcoming events." />
      </Helmet>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Event Management</h1>
          <p className={styles.subtitle}>
            Create new events and view the upcoming schedule.
          </p>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.formSection}>
            <EventManagement
              selectedEvent={selectedEvent}
              onClear={() => setSelectedEvent(null)}
            />
          </div>
          <div className={styles.listSection}>
            <h2 className={styles.listTitle}>Upcoming Events</h2>
            <UpcomingEventsList onEdit={(event) => setSelectedEvent(event)} />
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminEventsPage;