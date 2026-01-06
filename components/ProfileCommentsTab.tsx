import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, FileText } from "lucide-react";
import { useUserCommentsQuery } from "../helpers/useUserCommentsQuery";
import { Skeleton } from "./Skeleton";
import styles from "./ProfileTabs.module.css";

const CommentSkeleton = () => (
  <div className={styles.itemCard}>
    <Skeleton style={{ height: "1.25rem", width: "80%", marginBottom: "var(--spacing-3)" }} />
    <div className={styles.itemMeta}>
      <Skeleton style={{ height: "1rem", width: "250px" }} />
      <Skeleton style={{ height: "1rem", width: "100px" }} />
    </div>
  </div>
);

export const ProfileCommentsTab: React.FC<{ userId?: number }> = ({ userId }) => {
  const { data: comments, isFetching, error } = useUserCommentsQuery(userId);

  if (isFetching) {
    return (
      <div className={styles.itemsGrid}>
        {Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className={styles.infoState}>Error: {error.message}</div>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className={styles.infoState}>
        <MessageSquare size={48} className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>No Comments Yet</h3>
        <p className={styles.infoText}>You haven't commented on any posts.</p>
      </div>
    );
  }

  return (
    <div className={styles.itemsGrid}>
      {comments.map((comment) => (
        <div key={comment.id} className={styles.itemCard}>
          <p className={styles.commentContent}>"{comment.content}"</p>
          <div className={styles.itemMeta}>
            <Link to={`/posts/${comment.postSlug}`} className={styles.metaLink}>
              <FileText size={14} />
              <span>on {comment.postTitle}</span>
            </Link>
            <span className={styles.metaTimestamp}>
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};