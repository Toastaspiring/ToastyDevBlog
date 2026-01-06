import React, { useState } from "react";
import { Heart, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PostWithCounts } from "../endpoints/posts_GET.schema";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import { postPostLike } from "../endpoints/post/like_POST.schema"; // Import Like mutation function
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import Query tools
import styles from "./PostCard.module.css";

import { PostComments } from "./PostComments"; // Import PostComments

interface PostCardProps {
  post: PostWithCounts;
  className?: string;
  onToggleComments: () => void;
  isActive?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, className, onToggleComments, isActive }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fallback = post.author.displayName?.charAt(0).toUpperCase() || "?";

  // "Long Post" threshold
  const isLongPost = post.content.length > 300;

  const toggleExpand = () => {
    if (isLongPost) {
      setIsExpanded(!isExpanded);
    }
  };

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => postPostLike({ postId: post.id }),
    onSuccess: () => {
      // Invalidate posts query to refresh like count and status
      // Ideally we'd update optimistically, but invalidation is safer for now.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("PostCard: Like mutation error", error);
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <article
      id={`post-${post.slug}`}
      className={`${styles.card} ${className || ""} ${isActive ? styles.activeCard : ''}`}
      data-post-id={post.id}
    >
      <div className={styles.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2
            className={styles.title}
            onClick={toggleExpand}
            style={{ cursor: isLongPost ? 'pointer' : 'default', width: '100%' }}
          >
            {post.title}
          </h2>
        </div>

        <div className={styles.contentBody} data-expanded={isExpanded || !isLongPost}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, ...props }) => (
                <div className={styles.imageContainer}>
                  <img {...props} className={styles.postImage} />
                  {props.alt && <span className={styles.imageCaption}>{props.alt}</span>}
                </div>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {isLongPost && (
          <div className={styles.expandAction}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className={styles.expandButton}
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp size={20} />
                </>
              ) : (
                <>
                  <span>See More</span>
                  <ChevronDown size={20} />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.authorInfo}>
          <Avatar className={styles.authorAvatar}>
            <AvatarImage
              src={post.author.avatarUrl ?? undefined}
              alt={post.author.displayName}
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <p className={styles.authorName}>{post.author.displayName}</p>
            <time dateTime={new Date(post.createdAt).toISOString()} className={styles.date}>
              {formattedDate}
            </time>
          </div>
        </div>
        <div className={styles.stats}>
          <button
            className={styles.statItem}
            onClick={handleLike}
            disabled={likeMutation.isPending}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: post.isLiked ? '#ef4444' : 'inherit', // Red if liked
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Heart
              size={16}
              className={likeMutation.isPending ? "animate-pulse" : ""}
              fill={post.isLiked ? "#ef4444" : "none"} // Fill if liked
            />
            <span>{post.likeCount}</span>
          </button>
          <button
            className={styles.statItem}
            onClick={onToggleComments}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#3b82f6' : 'inherit', // Blue if active
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <MessageSquare size={16} />
            <span>{post.commentCount}</span>
          </button>
        </div>
      </footer>

      {/* Inline Comments - Visible on All Screens when active */}
      {isActive && (
        <div className={styles.inlineComments}>
          <div className={styles.inlineCommentsDivider} />
          <PostComments postSlug={post.slug} postId={post.id} />
        </div>
      )}
    </article>
  );
};