import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useUserByIdQuery } from "../helpers/useUserByIdQuery";
import { Avatar, AvatarFallback, AvatarImage } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import { ProfileCommentsTab } from "../components/ProfileCommentsTab";
import styles from "./profile.module.css";
// Reuse profile styles for consistency, or copy them if needed. 
// Assuming profile.module.css is generic enough or I'll just inline/copy if it fails.
// Let's assume reuse for now, or I'll check if it exports what I need.
// styles uses local classes. I should probably copy common styles or just use them.

const PublicUserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const userId = id ? parseInt(id) : NaN;
    const { data: user, isLoading, error } = useUserByIdQuery(userId);

    if (isLoading) {
        return (
            <main className={styles.main}>
                <div className={styles.profileHeader}>
                    <Skeleton style={{ width: "96px", height: "96px", borderRadius: "50%" }} />
                    <div className={styles.userInfo}>
                        <Skeleton style={{ width: "200px", height: "2rem", marginBottom: "var(--spacing-2)" }} />
                        <Skeleton style={{ width: "100px", height: "1.25rem" }} />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !user) {
        return (
            <main className={styles.main}>
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h2>User not found</h2>
                    <p>The user you are looking for does not exist.</p>
                    <Link to="/" style={{ color: "var(--primary)" }}>Go Home</Link>
                </div>
            </main>
        );
    }

    const fallback = user.displayName?.charAt(0).toUpperCase() || "U";

    return (
        <>
            <Helmet>
                <title>{user.displayName} | Dark Code</title>
                <meta name="description" content={`Profile of ${user.displayName}`} />
            </Helmet>
            <main className={styles.main}>
                <div className={styles.profileHeader}>
                    <Avatar className={styles.profileAvatar}>
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <div className={styles.userInfo}>
                        <h1 className={styles.displayName}>{user.displayName}</h1>
                        <Badge variant={user.role === "admin" ? "secondary" : "default"} className={styles.roleBadge}>
                            {user.role}
                        </Badge>
                        <p style={{ marginTop: '8px', color: 'var(--muted-foreground)' }}>
                            Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-8)' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-family-heading)',
                        fontSize: '1.25rem',
                        marginBottom: 'var(--spacing-4)',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: 'var(--spacing-2)'
                    }}>Recent Comments</h3>
                    <ProfileCommentsTab userId={user.id} />
                </div>
            </main >
        </>
    );
};

export default PublicUserProfile;
