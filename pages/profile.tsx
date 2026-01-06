import React from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "../helpers/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { ProfileCommentsTab } from "../components/ProfileCommentsTab";
import { ProfileLikedPostsTab } from "../components/ProfileLikedPostsTab";
import { ProfileCreatedPostsTab } from "../components/ProfileCreatedPostsTab";
import { Skeleton } from "../components/Skeleton";
import styles from "./profile.module.css";

const ProfilePage: React.FC = () => {
  const { authState } = useAuth();

  if (authState.type !== "authenticated") {
    // This should ideally not be reached due to ProtectedRoute,
    // but it's good practice for type safety and as a fallback.
    return (
      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <Skeleton style={{ width: "96px", height: "96px", borderRadius: "50%" }} />
          <div className={styles.userInfo}>
            <Skeleton style={{ width: "200px", height: "2rem", marginBottom: "var(--spacing-2)" }} />
            <Skeleton style={{ width: "250px", height: "1.25rem" }} />
          </div>
        </div>
      </main>
    );
  }

  const { user } = authState;
  const fallback = user.displayName?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <Helmet>
        <title>My Profile - Dark Code</title>
        <meta name="description" content="View your profile, comments, and liked posts on Dark Code." />
      </Helmet>
      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <Avatar className={styles.profileAvatar}>
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className={styles.userInfo}>
            <h1 className={styles.displayName}>{user.displayName}</h1>
            <p className={styles.email}>{user.email}</p>
            <Badge variant={user.role === "admin" ? "secondary" : "default"} className={styles.roleBadge}>
              {user.role}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="comments" className={styles.tabsContainer}>
          <TabsList>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="liked-posts">Liked Posts</TabsTrigger>
            {user.role === "admin" && (
              <TabsTrigger value="created-posts">Created Posts</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="comments" className={styles.tabContent}>
            <ProfileCommentsTab />
          </TabsContent>
          <TabsContent value="liked-posts" className={styles.tabContent}>
            <ProfileLikedPostsTab />
          </TabsContent>
          {user.role === "admin" && (
            <TabsContent value="created-posts" className={styles.tabContent}>
              <ProfileCreatedPostsTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </>
  );
};

export default ProfilePage;