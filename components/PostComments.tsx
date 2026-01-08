import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { MessageSquare, Loader2, Send } from "lucide-react";

import { usePostBySlugQuery } from "../helpers/usePostBySlugQuery";
import { useAuth } from "../helpers/useAuth";
import { useCreateCommentMutation } from "../helpers/useCreateCommentMutation";
import { useUsersSearchQuery } from "../helpers/useUsersSearchQuery";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Spinner } from "./Spinner";

import styles from "./PostComments.module.css";

import { useDebounce } from "../helpers/useDebounce";

// Simple suggestion list component
const SuggestionList: React.FC<{
    query: string;
    onSelect: (user: { displayName: string }) => void;
}> = ({ query, onSelect }) => {
    const debouncedQuery = useDebounce(query, 1000);
    const { data: users, isLoading } = useUsersSearchQuery(debouncedQuery);

    if (!query || (!isLoading && (!users || users.length === 0))) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: '250px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            overflow: 'hidden',
        }}>
            {isLoading ? (
                <div style={{ padding: '8px', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Loading...</div>
            ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {users?.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => onSelect(user)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderBottom: '1px solid var(--border)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Avatar style={{ width: 24, height: 24 }}>
                                <AvatarImage src={user.avatarUrl ?? undefined} />
                                <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.displayName}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

interface PostCommentsProps {
    postSlug: string;
    postId: number; // passed if available, though query fetches it too.
    enabled?: boolean;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postSlug, postId, enabled = true }) => {
    // We fetch the post details to get comments
    const { data: post, isLoading, error } = usePostBySlugQuery(postSlug, { enabled });
    const { authState } = useAuth();
    const createCommentMutation = useCreateCommentMutation(postSlug);
    const [commentContent, setCommentContent] = useState("");

    // Mention state
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;
        setCommentContent(newValue);
        setCursorPosition(e.target.selectionStart);

        // Check for mentions
        const textBeforeCursor = newValue.slice(0, newCursorPos);
        const lastWordMatch = textBeforeCursor.match(/@(\w*)$/);

        if (lastWordMatch) {
            setMentionQuery(lastWordMatch[1]);
        } else {
            setMentionQuery(null);
        }
    };

    const handleUserSelect = (user: { displayName: string }) => {
        if (!textareaRef.current) return;

        const textBeforeCursor = commentContent.slice(0, cursorPosition);
        const textAfterCursor = commentContent.slice(cursorPosition);

        // Replace the partial mention with the full user name
        const lastAtPos = textBeforeCursor.lastIndexOf('@');
        const newTextBefore = textBeforeCursor.slice(0, lastAtPos) + `@${user.displayName} `;

        const newContent = newTextBefore + textAfterCursor;
        setCommentContent(newContent);
        setMentionQuery(null);

        // Restore focus and update cursor (approximate)
        setTimeout(() => {
            const newCursor = newTextBefore.length;
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursor, newCursor);
            }
        }, 0);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || !post) return;

        createCommentMutation.mutate(
            {
                postId: post.id,
                content: commentContent,
            },
            {
                onSuccess: () => {
                    setCommentContent("");
                    setMentionQuery(null);
                },
            }
        );
    };

    if (!enabled && !post) {
        return null;
    }

    if (isLoading && enabled) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner size="sm" /></div>;
    }

    if (error || !post) {
        return <div style={{ padding: '10px', color: 'red' }}>Error loading comments.</div>;
    }

    return (
        <section className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
                <MessageSquare size={20} />
                <span>Comments ({post.comments.length})</span>
            </div>

            <div className={styles.commentList}>
                {post.comments.length === 0 ? (
                    <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: '0.9rem' }}>No comments yet.</p>
                ) : (
                    post.comments.map((comment) => (
                        <div key={comment.id} className={styles.comment}>
                            <Avatar className={styles.commentAvatar}>
                                <AvatarImage src={comment.user.avatarUrl ?? undefined} />
                                <AvatarFallback>{comment.user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className={styles.commentBody}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentAuthor}>{comment.user.displayName}</span>
                                    <span className={styles.commentDate}>
                                        {format(new Date(comment.createdAt), "MMM d, HH:mm")}
                                    </span>
                                </div>
                                <div className={styles.commentText}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {comment.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {authState.type === "authenticated" ? (
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <div style={{ position: 'relative' }}>
                        {mentionQuery !== null && (
                            <SuggestionList query={mentionQuery} onSelect={handleUserSelect} />
                        )}
                        <Textarea
                            ref={textareaRef}
                            placeholder="Write a comment..."
                            value={commentContent}
                            onChange={handleCommentChange}
                            onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                            onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                            rows={2}
                            style={{ marginBottom: 'var(--spacing-3)', backgroundColor: 'var(--background)', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" size="sm" disabled={createCommentMutation.isPending || !commentContent.trim()}>
                            {createCommentMutation.isPending ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    <Link to={`/login?redirect=/`} className={styles.loginLink}>Log in</Link> to comment.
                </div>
            )}
        </section>
    );
};
