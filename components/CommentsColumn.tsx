import React from "react";
import { X, MessageSquare } from "lucide-react";
import { PostComments } from "./PostComments";
import styles from "./CommentsColumn.module.css";
import { Button } from "./Button";

interface CommentsColumnProps {
    postSlug: string | null;
    postId: number | null;
    postTitle: string | null;
    onClose: () => void;
}

export const CommentsColumn: React.FC<CommentsColumnProps> = ({
    postSlug,
    postId,
    postTitle,
    onClose,
}) => {
    const [isMinimized, setIsMinimized] = React.useState(true);

    if (!postSlug || !postId) {
        return (
            <div className={styles.emptyState}>
                <MessageSquare size={48} style={{ opacity: 0.2 }} />
                <p>Select a post to view comments</p>
            </div>
        );
    }

    if (isMinimized) {
        return (
            <div className={styles.minimizedTab} onClick={() => setIsMinimized(false)}>
                <MessageSquare size={20} />
                <span>Comments</span>
            </div>
        );
    }

    return (
        <aside className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <MessageSquare size={20} />
                    <h3>Comments</h3>
                </div>
                <div className={styles.actions}>
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>−</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>
            </header>

            {/* Replying to context removed as per user request (tip widget) */}

            <div className={styles.content}>
                <PostComments postSlug={postSlug} postId={postId} />
            </div>
        </aside>
    );
};
