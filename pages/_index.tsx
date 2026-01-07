import React, { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { usePostsQuery } from "../helpers/usePostsQuery";
import { PostCard } from "../components/PostCard";
import { PostCardSkeleton } from "../components/PostCardSkeleton";
import { EventCountdown } from "../components/EventCountdown";
import { CommentsColumn } from "../components/CommentsColumn";
import styles from "./_index.module.css";

const HomePage: React.FC = () => {
  const { data: posts, isFetching, error } = usePostsQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // State for the Active Post in the Comments Column
  const [activePostId, setActivePostId] = React.useState<number | null>(null);

  const activePost = React.useMemo(() => {
    return posts?.find(p => p.id === activePostId) || null;
  }, [posts, activePostId]);

  // ScrollSpy removed in favor of manual toggle for inline comments

  const filteredPosts = useMemo(() => {
    if (!posts || !searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const contentMatch = post.contentPreview.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }, [posts, searchQuery]);

  // Handler no longer needed for manual toggle, BUT user might click comment icon to "Force" focus or scroll to comments.
  // Actually, clicking comment icon on Desktop -> Focuses that posts (which is already focused if centered).
  // Clicking on Mobile -> Should scroll/expand to the inline comments.
  // Toggles the inline comments for a post and syncs URL
  const handleToggleComments = (post: { id: number; slug: string }) => {
    if (activePostId === post.id) {
      setActivePostId(null);
      // Remove param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("post");
      setSearchParams(newParams, { replace: true });
    } else {
      setActivePostId(post.id);
      // Set param
      const newParams = new URLSearchParams(searchParams);
      newParams.set("post", post.slug);
      setSearchParams(newParams, { replace: true });
    }
  };

  const [highlightedPostId, setHighlightedPostId] = React.useState<number | null>(null);

  // Handle URL Parameter Navigation (Highlight + Expand)
  React.useEffect(() => {
    if (posts) {
      const slug = searchParams.get("post");
      if (slug) {
        const targetPost = posts.find(p => p.slug === slug);
        if (targetPost) {
          if (targetPost.id !== activePostId) {
            setActivePostId(targetPost.id); // Expand comments
          }
          // Optional: Scroll to it if it's the first load or explicit navigation
          // check if we just arrived or if this is a deeper nav
        }
      } else {
        // If no param, ensure closed (optional, but good for back button)
        if (activePostId !== null) {
          setActivePostId(null);
        }
      }
    }
  }, [posts, searchParams, activePostId]);

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.postsList}>
          {Array.from({ length: 6 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.infoState}>
          <h2>Error loading posts</h2>
          <p>{error.message}</p>
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className={styles.infoState}>
          <h2>No posts yet</h2>
          <p>Check back later for new content!</p>
        </div>
      );
    }

    if (searchQuery && (!filteredPosts || filteredPosts.length === 0)) {
      return (
        <div className={styles.infoState}>
          <h2>No posts found</h2>
          <p>
            No posts match your search for "{searchQuery}". Try different
            keywords or{" "}
            <Link to="/" className={styles.clearSearchLink}>
              clear the search
            </Link>
            .
          </p>
        </div>
      );
    }

    return (
      <div className={styles.postsList}>
        {filteredPosts!.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isActive={activePostId === post.id}
            onToggleComments={() => handleToggleComments(post)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>ToastyDevBlog</title>
        <meta
          name="description"
          content="A blog platform for developers, focusing on dark themes and clean design."
        />
      </Helmet>
      <main className={styles.main}>
        <div className={styles.layoutGrid}>
          <div className={styles.leftColumn}>
            <EventCountdown />
            {renderContent()}
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;