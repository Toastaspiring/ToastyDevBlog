import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MessageSquare } from "lucide-react";
import { PostComments } from "./PostComments";
import styles from "./CommentsSidePanel.module.css";
import { Button } from "./Button";

interface CommentsSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    postSlug: string;
    postId: number;
    postTitle: string;
}

export const CommentsSidePanel: React.FC<CommentsSidePanelProps> = ({
    isOpen,
    onClose,
    postSlug,
    postId,
    postTitle,
}) => {
    const [mounted, setMounted] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Small delay to allow render before adding active class for transition
            requestAnimationFrame(() => setActive(true));
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            setActive(false);
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleClose = () => {
        setActive(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className={`${styles.overlay} ${active ? styles.active : ''}`}
            onClick={handleClose}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
            <div
                className={`${styles.panel} ${active ? styles.active : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <MessageSquare size={20} />
                        <h3>Comments</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        <X size={24} />
                    </Button>
                </header>

                <div className={styles.postContext}>
                    <span className={styles.postContextLabel}>Replying to:</span>
                    <h4 className={styles.postContextTitle}>{postTitle}</h4>
                </div>

                <div className={styles.content}>
                    <PostComments postSlug={postSlug} postId={postId} />
                </div>
            </div>
        </div>,
        document.body
    );
};
