import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Heart, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkSupersub from "remark-supersub";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css"; // Math CSS
import "highlight.js/styles/github-dark.css"; // Code block CSS
import { PostWithCounts } from "../endpoints/posts_GET.schema";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import { postPostLike } from "../endpoints/post/like_POST.client"; // Import Like mutation function
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import Query tools
import { useAuth } from "../helpers/useAuth";
import styles from "./PostCard.module.css";

import { PostComments } from "./PostComments"; // Import PostComments

interface PostCardProps {
  post: PostWithCounts;
  className?: string;
  onToggleComments: () => void;
  isActive?: boolean;
  previewMode?: boolean; // New prop
}

export const PostCard: React.FC<PostCardProps> = ({ post, className, onToggleComments, isActive, previewMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(previewMode); // Expanded by default in preview
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fallback = post.author.displayName?.charAt(0).toUpperCase() || "?";

  // Determine if post is long based on actual height
  const [isLongPost, setIsLongPost] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      // 250px matches the max-height in CSS
      setIsLongPost(contentRef.current.scrollHeight > 250);
    }
  }, [post.content]);

  // Force expansion in preview mode
  React.useEffect(() => {
    if (previewMode) setIsExpanded(true);
  }, [previewMode]);

  const toggleExpand = () => {
    if (isLongPost && !previewMode) {
      setIsExpanded(!isExpanded);
    }
  };

  // Optimistic Like State
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync state if prop changes (rare, but good for consistency)
  React.useEffect(() => {
    setIsLiked(post.isLiked);
    setLikeCount(post.likeCount);
  }, [post.isLiked, post.likeCount]);

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => postPostLike({ postId: post.id }),
    onSuccess: () => {
      // We don't invalidate immediately to avoid "reloading" flicker.
      // The local state is already correct.
      // Ideally we would invalidate after a long delay or on page focus.
    },
    onError: (error) => {
      console.error("PostCard: Like mutation error", error);
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  });

  const { authState } = useAuth();

  const handleLike = () => {
    if (previewMode) return; // Disable in preview

    if (authState.type !== "authenticated") {
      toast.error("You must be logged in to like posts.", {
        action: {
          label: "Log in",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    // 1. Optimistic Update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1);

    // 2. Trigger Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400); // 400ms match css animation duration

    // 3. Fire mutation
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
            style={{ cursor: isLongPost && !previewMode ? 'pointer' : 'default', width: '100%' }}
          >
            {post.title}
          </h2>
        </div>

        <div
          className={styles.contentBody}
          data-expanded={isExpanded || !isLongPost || previewMode}
          ref={contentRef}
          style={{
            maxHeight: (isExpanded || previewMode) && contentRef.current
              ? `${contentRef.current.scrollHeight}px`
              : undefined
          }}
        >
          <ReactMarkdown
            remarkPlugins={[
              [remarkGfm, { singleTilde: false }],
              remarkBreaks,
              remarkMath,
              remarkSupersub
            ]}
            rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
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

        {isLongPost && !previewMode && (
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
            disabled={likeMutation.isPending || previewMode}
            style={{
              background: 'none',
              border: 'none',
              cursor: previewMode ? 'default' : 'pointer',
              color: isLiked ? '#ef4444' : 'inherit', // Red if liked
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: previewMode ? 0.7 : 1
            }}
          >
            <Heart
              size={16}
              className={isAnimating ? styles.bounce : ""}
              fill={isLiked ? "#ef4444" : "none"} // Fill if liked
            />
            <span>{likeCount}</span>
          </button>
          <button
            className={styles.statItem}
            onClick={previewMode ? undefined : onToggleComments}
            disabled={previewMode}
            style={{
              background: 'none',
              border: 'none',
              cursor: previewMode ? 'default' : 'pointer',
              color: isActive ? '#3b82f6' : 'inherit', // Blue if active
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: previewMode ? 0.7 : 1
            }}
          >
            <MessageSquare size={16} />
            <span>{post.commentCount}</span>
          </button>
        </div>
      </footer>

      {/* Inline Comments - Always rendered but animated */}
      <div
        className={styles.inlineCommentsWrapper}
        data-active={isActive}
      >
        <div className={styles.inlineCommentsInner}>
          <div className={styles.inlineComments}>
            <div className={styles.inlineCommentsDivider} />
            <PostComments postSlug={post.slug} postId={post.id} enabled={isActive} />
          </div>
        </div>
      </div>
    </article>
  );
};