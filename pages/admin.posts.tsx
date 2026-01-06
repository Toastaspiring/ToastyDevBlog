import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { usePostsQuery } from "../helpers/usePostsQuery";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import styles from "./admin.posts.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeletePostMutation } from "../helpers/useDeletePostMutation";
import { toast } from "sonner";

const AdminPostsPage: React.FC = () => {
    // Fetch posts in admin mode to see drafts
    const { data: posts, isLoading, error } = usePostsQuery({ mode: 'admin' });
    const navigate = useNavigate();

    const deletePostMutation = useDeletePostMutation();

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            deletePostMutation.mutate({ id });
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error)' }}>
                <h2>Error loading posts</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Manage Posts - Admin</title>
            </Helmet>
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Manage Posts</h1>
                    <Button asChild size="md">
                        <Link to="/admin/editor">
                            <Plus size={20} />
                            Create New Post
                        </Link>
                    </Button>
                </header>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Stats</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts?.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <div className={styles.postTitle}>{post.title}</div>
                                        <div className={styles.postMeta}>/{post.slug}</div>
                                    </td>
                                    <td>
                                        <span className={post.published ? styles.statusPublished : styles.statusDraft}>
                                            {post.published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className={styles.postMeta}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.postMeta}>
                                        {post.likeCount} Likes • {post.commentCount} Comments
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/#post-${post.slug}`} target="_blank">
                                                    <Eye size={16} />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/admin/editor/${post.slug}`}>
                                                    <Edit size={16} />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} style={{ color: 'var(--error)' }} disabled={deletePostMutation.isPending}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!posts || posts.length === 0) && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className={styles.emptyState}>
                                            <p>No posts found. Create your first one!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default AdminPostsPage;
