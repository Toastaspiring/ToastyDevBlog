import { OAuthProviderInterface, OAuthProviderType } from "./OAuthProvider";
import { FlootOAuthProvider } from "./FlootOAuthProvider";
import { GitHubOAuthProvider } from "./GitHubOAuthProvider";

export function getOAuthProvider(
  providerName: OAuthProviderType,
  redirectUri: string
): OAuthProviderInterface {
  switch (providerName) {
    case "floot":
      return new FlootOAuthProvider(redirectUri);
    case "github":
      return new GitHubOAuthProvider(redirectUri);
  }
}
