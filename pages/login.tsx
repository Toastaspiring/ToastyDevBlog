import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Code2 } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.type === "authenticated") {
      navigate("/", { replace: true });
    }
  }, [authState, navigate]);

  const isLoading = authState.type === "loading";

  return (
    <>
      <Helmet>
        <title>Login - ToastyDevBlog</title>
        <meta name="description" content="Sign in to ToastyDevBlog to engage with the community." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <Code2 size={32} className={styles.logo} />
            <h1 className={styles.title}>ToastyDevBlog</h1>
          </div>
          <p className={styles.subtitle}>
            Sign in to like and comment on posts.
          </p>
          <div className={styles.oauthSection}>
            <OAuthButtonGroup disabled={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;