import React from "react";
import { GitHubLoginButton } from "./GitHubLoginButton";
import styles from "./OAuthButtonGroup.module.css";

interface OAuthButtonGroupProps {
  className?: string;
  disabled?: boolean;
}

export const OAuthButtonGroup: React.FC<OAuthButtonGroupProps> = ({
  className,
  disabled,
}) => {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      <GitHubLoginButton disabled={disabled} />
      {/* Add more OAuth provider buttons here as needed */}
    </div>
  );
};
