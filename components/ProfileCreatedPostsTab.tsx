import React from "react";
import { Link } from "react-router-dom";
import { Edit3, Heart, MessageSquare } from "lucide-react";
import { useUserCreatedPostsQuery } from "../helpers/useUserCreatedPostsQuery";
import { Skeleton } from "./Skeleton";
import { Badge } from "./Badge";
import styles from "./ProfileTabs.module.css";

const CreatedPostSkeleton = () => (
  <div className={styles.itemCard}>
    <div className={styles.createdPostHeader}>
      <Skeleton style={{ height: "1.5rem", width: "70%" }} />
      <Skeleton style={{ height: "24px", width: "80px", borderRadius: "var(--radius-full)" }} />
    </div>
    <div className={styles.itemMeta}>
      <div className={styles.createdPostStats}>
        <Skeleton style={{ height: "1rem", width: "60px" }} />
        <Skeleton style={{ height: "1rem", width: "60px" }} />
      </div>
      <Skeleton style={{ height: "1rem", width: "150px" }} />
    </div>
  </div>
);

export const ProfileCreatedPostsTab: React.FC = () => {
  const { data: posts, isFetching, error } = useUserCreatedPostsQuery();

  if (isFetching) {
    return (
      <div className={styles.itemsGrid}>
        {Array.from({ length: 3 }).map((_, i) => <CreatedPostSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className={styles.infoState}>Error: {error.message}</div>;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.infoState}>
        <Edit3 size={48} className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>No Posts Created</h3>
        <p className={styles.infoText}>You haven't created any posts yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.itemsGrid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.itemCard}>
          <div className={styles.createdPostHeader}>
            <Link to={`/posts/${post.slug}`} className={styles.itemTitleLink}>
              {post.title}
            </Link>
            <Badge variant={post.published ? "success" : "outline"}>
              {post.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className={styles.itemMeta}>
            <div className={styles.createdPostStats}>
              <span className={styles.statItem}>
                <Heart size={14} /> {post.likeCount}
              </span>
              <span className={styles.statItem}>
                <MessageSquare size={14} /> {post.commentCount}
              </span>
            </div>
            <span className={styles.metaTimestamp}>
              Created on {new Date(post.createdAt).toLocaleDateString("en-US", {
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