import React from "react";
import { Link } from "react-router-dom";
import { Heart, User } from "lucide-react";
import { useUserLikedPostsQuery } from "../helpers/useUserLikedPostsQuery";
import { Skeleton } from "./Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import styles from "./ProfileTabs.module.css";

const LikedPostSkeleton = () => (
  <div className={styles.itemCard}>
    <Skeleton style={{ height: "1.5rem", width: "60%", marginBottom: "var(--spacing-3)" }} />
    <div className={styles.itemMeta}>
      <div className={styles.metaAuthor}>
        <Skeleton style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
        <Skeleton style={{ height: "1rem", width: "120px" }} />
      </div>
      <Skeleton style={{ height: "1rem", width: "100px" }} />
    </div>
  </div>
);

export const ProfileLikedPostsTab: React.FC = () => {
  const { data: posts, isFetching, error } = useUserLikedPostsQuery();

  if (isFetching) {
    return (
      <div className={styles.itemsGrid}>
        {Array.from({ length: 3 }).map((_, i) => <LikedPostSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className={styles.infoState}>Error: {error.message}</div>;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.infoState}>
        <Heart size={48} className={styles.infoIcon} />
        <h3 className={styles.infoTitle}>No Liked Posts</h3>
        <p className={styles.infoText}>You haven't liked any posts yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.itemsGrid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.itemCard}>
          <Link to={`/posts/${post.slug}`} className={styles.itemTitleLink}>
            {post.title}
          </Link>
          <div className={styles.itemMeta}>
            <div className={styles.metaAuthor}>
              <Avatar className={styles.metaAvatar}>
                <AvatarImage src={post.authorAvatarUrl ?? undefined} alt={post.authorDisplayName} />
                <AvatarFallback>
                  {post.authorDisplayName?.charAt(0).toUpperCase() || <User size={12} />}
                </AvatarFallback>
              </Avatar>
              <span>{post.authorDisplayName}</span>
            </div>
            <span className={styles.metaTimestamp}>
              Liked on {new Date(post.likedAt).toLocaleDateString("en-US", {
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