export function getOAuthRedirectUri(url: string): string {
  /* 
   * Derive the callback URL from the authorize URL.
   * This works regardless of whether we are running on localhost with /_api proxy
   * or on Supabase Functions with /functions/v1/api.
   * It assumes the authorize and callback endpoints are siblings.
   */
  return url.split("?")[0].replace("oauth_authorize", "oauth_callback");
}
