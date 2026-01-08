import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getPosts } from "../endpoints/posts_GET.client";
import { POSTS_QUERY_KEY } from "../helpers/usePostsQuery";
import { getEventsList } from "../endpoints/events/list_GET.client";
import { AnimatedBackground } from "./AnimatedBackground";
import { CalendarDays, Code2, LogIn, LogOut, PlusCircle, User as UserIcon, Search } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import { Button } from "./Button";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Spinner } from "./Spinner";
import { Input } from "./Input";
import styles from "./SharedLayout.module.css";
import { useGlobalLoading } from "../helpers/GlobalLoadingContext";

export const SharedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { setGlobalLoading } = useGlobalLoading();

  const location = useLocation();

  const handleTitleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // If we are NOT on the homepage, just navigate normally without delay
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    // 1. Force Global Loading State (Skeletons everywhere)
    setGlobalLoading(true);

    // 2. Cancel any ongoing refetches (optional but good practice)
    await Promise.all([
      queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY }),
      queryClient.cancelQueries({ queryKey: ["events"] })
    ]);

    // 3. Parallel Execution: Fetch Data AND Wait 2s minimum
    const postsPromise = getPosts();
    const eventsPromise = getEventsList();
    const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // 4. Wait for EVERYTHING to finish
      const [postsData, eventsData] = await Promise.all([
        postsPromise,
        eventsPromise,
        delayPromise
      ]);

      // 5. Update the cache with the fresh data
      queryClient.setQueryData(POSTS_QUERY_KEY, postsData);
      queryClient.setQueryData(["events"], eventsData);
    } catch (error) {
      console.error("[GracefulReload] Reload failed", error);
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } finally {
      // 6. Turn off loading state (Back to Content)
      setGlobalLoading(false);
    }

    // Already on page, but explicit navigate ensures url correctness
    navigate("/");
  };

  const renderAuthControls = () => {
    if (authState.type === "loading") {
      return <Spinner size="sm" />;
    }

    if (authState.type === "authenticated") {
      const { user } = authState;
      const fallback = user.displayName?.charAt(0).toUpperCase() || "?";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-md" className={styles.avatarButton}>
              <Avatar>
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className={styles.userMenuInfo}>
                <p className={styles.userMenuName}>{user.displayName}</p>
                <p className={styles.userMenuEmail}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon size={16} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { }}>
              <span className={styles.notificationBadge} />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/login">
          <LogIn size={16} />
          Login
        </Link>
      </Button>
    );
  };

  return (
    <div className={styles.layout}>
      <AnimatedBackground />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/" onClick={handleTitleClick} className={styles.logoLink}>
            <Code2 size={28} className={styles.logoIcon} />
            <span className={styles.logoText}>ToastyDevBlog</span>
          </a>
          <div className={styles.actions}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </form>
            {authState.type === "authenticated" && authState.user.role === "admin" && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/events">
                    <CalendarDays size={16} />
                    Events
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/admin/posts">
                    <PlusCircle size={16} />
                    Posts
                  </Link>
                </Button>
              </>
            )}
            <ThemeModeSwitch />
            {renderAuthControls()}
          </div>
        </div>
      </header>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ToastyDevBlog. All rights reserved.</p>
      </footer>
    </div>
  );
};