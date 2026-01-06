import React from "react";
import { Skeleton } from "./Skeleton";
import styles from "./PostCardSkeleton.module.css";

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.previewLine1} />
        <Skeleton className={styles.previewLine2} />
      </div>
      <div className={styles.footer}>
        <div className={styles.authorInfo}>
          <Skeleton className={styles.avatar} />
          <div className={styles.authorText}>
            <Skeleton className={styles.authorName} />
            <Skeleton className={styles.date} />
          </div>
        </div>
        <div className={styles.stats}>
          <Skeleton className={styles.statItem} />
          <Skeleton className={styles.statItem} />
        </div>
      </div>
    </div>
  );
};