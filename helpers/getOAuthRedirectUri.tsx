export function getOAuthRedirectUri(url: string): string {
  const urlObj = new URL(url);
  return `${urlObj.origin}/auth/oauth_callback`;
}
