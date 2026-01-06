import React from "react";
import { OAuthLoginButton } from "./OAuthLoginButton";
import { Github } from "lucide-react";

interface GitHubLoginButtonProps {
  className?: string;
  disabled?: boolean;
}

export const GitHubLoginButton: React.FC<GitHubLoginButtonProps> = ({
  className,
  disabled,
}) => {
  return (
    <OAuthLoginButton
      provider="github"
      className={className}
      disabled={disabled}
    >
      <Github size={20} />
      <span>Continue with GitHub</span>
    </OAuthLoginButton>
  );
};