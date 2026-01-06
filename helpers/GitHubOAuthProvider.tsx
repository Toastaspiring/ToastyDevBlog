import {
  OAuthProviderInterface,
  OAuthTokens,
  StandardUserData,
  OAuthError,
} from "./OAuthProvider";

// Helper interface for GitHub's primary email response
interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}

export class GitHubOAuthProvider implements OAuthProviderInterface {
  public readonly name = "github";
  public readonly clientId: string;
  public readonly authUrl = "https://github.com/login/oauth/authorize";
  public readonly scopes = "read:user user:email";
  public readonly redirectUri: string;
  private readonly clientSecret: string;
  private readonly tokenUrl = "https://github.com/login/oauth/access_token";
  private readonly userInfoUrl = "https://api.github.com/user";
  private readonly userEmailsUrl = "https://api.github.com/user/emails";

  constructor(redirectUri: string) {
    this.clientId = process.env.GITHUB_CLIENT_ID || "";
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
    this.redirectUri = redirectUri;

    if (!this.clientId) {
      const error = new Error(
        "GITHUB_CLIENT_ID environment variable is required"
      );
      console.error("GitHubOAuthProvider initialization failed:", error);
      throw error;
    }

    if (!this.clientSecret) {
      const error = new Error(
        "GITHUB_CLIENT_SECRET environment variable is required"
      );
      console.error("GitHubOAuthProvider initialization failed:", error);
      throw error;
    }
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokens> {
    console.log(
      "GitHubOAuthProvider: Exchanging authorization code for tokens",
      {
        codeLength: code.length,
        redirectUri,
      }
    );

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: redirectUri,
    });

    let response: Response;
    try {
      response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });
    } catch (fetchError) {
      console.error("GitHubOAuthProvider: Token exchange fetch error:", {
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
        url: this.tokenUrl,
      });
      throw new OAuthError(
        "NETWORK_ERROR",
        `Token exchange request failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        this.name,
        fetchError
      );
    }

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = "Could not read error response body";
      }
      console.error(
        "GitHubOAuthProvider: Token exchange failed with error response:",
        {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        }
      );
      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        `Token exchange failed: ${response.status} ${response.statusText}. Response: ${errorText}`,
        this.name,
        { status: response.status, body: errorText }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        "GitHubOAuthProvider: Failed to parse token exchange response JSON:",
        {
          error:
            jsonError instanceof Error ? jsonError.message : String(jsonError),
        }
      );
      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        `Token exchange succeeded but response is not valid JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        this.name,
        jsonError
      );
    }

    if (data.error) {
      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        `GitHub returned an error: ${data.error_description || data.error}`,
        this.name,
        data
      );
    }

    if (!data.access_token) {
      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        "No access token received from GitHub",
        this.name,
        data
      );
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type || "Bearer",
      scope: data.scope || undefined,
    };
  }

  async fetchUserInfo(tokens: OAuthTokens): Promise<any> {
    const authHeader = `${tokens.tokenType || "Bearer"} ${tokens.accessToken}`;

    let response: Response;
    try {
      response = await fetch(this.userInfoUrl, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/vnd.github.v3+json",
        },
      });
    } catch (fetchError) {
      console.error("GitHubOAuthProvider: User info fetch error:", {
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
      });
      throw new OAuthError(
        "NETWORK_ERROR",
        `User info request failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        this.name,
        fetchError
      );
    }

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = "Could not read error response body";
      }
      console.error(
        "GitHubOAuthProvider: User info fetch failed with error response:",
        {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        }
      );
      throw new OAuthError(
        "USER_INFO_FETCH_FAILED",
        `User info fetch failed: ${response.status} ${response.statusText}. Response: ${errorText}`,
        this.name,
        { status: response.status, body: errorText }
      );
    }

    let userInfo: any;
    try {
      userInfo = await response.json();
    } catch (jsonError) {
      console.error(
        "GitHubOAuthProvider: Failed to parse user info response JSON:",
        {
          error:
            jsonError instanceof Error ? jsonError.message : String(jsonError),
        }
      );
      throw new OAuthError(
        "USER_INFO_FETCH_FAILED",
        `User info fetch succeeded but response is not valid JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        this.name,
        jsonError
      );
    }

    // If email is not in the main user object, fetch it from the emails endpoint
    if (!userInfo.email) {
      try {
        const emailsResponse = await fetch(this.userEmailsUrl, {
          headers: {
            Authorization: authHeader,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (emailsResponse.ok) {
          const emails: GitHubEmail[] = await emailsResponse.json();
          const primaryEmail = emails.find((e) => e.primary && e.verified);
          if (primaryEmail) {
            userInfo.email = primaryEmail.email;
          }
        }
      } catch (emailFetchError) {
        console.warn(
          "GitHubOAuthProvider: Failed to fetch user emails, continuing without it.",
          emailFetchError
        );
      }
    }

    return userInfo;
  }

  mapUserData(userInfo: any): StandardUserData {
    if (!userInfo) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "No user info provided to map",
        this.name,
        userInfo
      );
    }

    if (!userInfo.id) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "GitHub user info missing required id field",
        this.name,
        userInfo
      );
    }

    if (!userInfo.email) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "GitHub user info missing required email field. Ensure the user has a public email or the 'user:email' scope is granted.",
        this.name,
        userInfo
      );
    }

    const mappedData: StandardUserData = {
      email: userInfo.email,
      displayName: userInfo.name || userInfo.login,
      avatarUrl: userInfo.avatar_url || null,
      providerUserId: String(userInfo.id),
    };

    return mappedData;
  }

  generateAuthorizationUrl(state: string): { url: string } {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state,
    });

    const authUrl = `${this.authUrl}?${params.toString()}`;

    return { url: authUrl };
  }
}