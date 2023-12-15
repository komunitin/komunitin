import { KOptions } from "../boot/koptions";
import KError, { KErrorCode } from "src/KError";
//https://quasar.dev/quasar-plugins/web-storage

import LocalStorage from "./LocalStorage";

/**
 * User data fetched from OIDC /userinfo endpoint.
 * https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
 */
export interface User {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  preferredUsername: string;
  zoneinfo: string;
}

export interface AuthOptions {
  /**
   * Absolute URL of the OAuth2 token endpoint.
   */
  tokenEndpoint: string;
  /**
   * Absolute URL of OIDC userinfo endpoint
   */
  userInfoEndpoint: string;
  /**
   * OAuth2 Client ID.
   */
  clientId: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
}

interface TokenRequestData {
  grant_type: string;
  client_id?: string;
  username?: string;
  password?: string;
  scope?: string;
  refresh_token?: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpire: Date;
  scopes: string[];
}

/**
 * Implements OAuth2 client with the features:
 *  - `Resource Owner Password` flow for direct login with email & password.
 *  - Refresh credentials through refresh tokens.
 *  - OIDC social login with Google and Facebook (TODO)
 */
export class Auth {
  public static readonly STORAGE_KEY: string = "auth-session";
  public static readonly SCOPES = "komunitin_social komunitin_accounting email offline_access openid profile";

  private readonly tokenEndpoint: string;
  private readonly userInfoEndpoint: string;

  constructor(options: AuthOptions) {
    this.tokenEndpoint = options.tokenEndpoint;
    this.userInfoEndpoint = options.userInfoEndpoint;
  }

  /**
   * Retrieve AuthData stored in LocalStorage.
   */
  public async getStoredTokens(): Promise<AuthData | undefined> {
    const data = await LocalStorage.getItem(Auth.STORAGE_KEY)
    if (data !== null) {
      data.accessTokenExpire = new Date(data.accessTokenExpire);
      return data as AuthData;
    }
    return undefined;
  }
  /**
   * Do the necessary things to logout the user identified by given AuthData.
   * 
   * Actually, it just deletes the saved token but in future it could do server
   * side operations.
   */
  public async logout() {
    if (await LocalStorage.has(Auth.STORAGE_KEY)) {
      await LocalStorage.remove(Auth.STORAGE_KEY);
    }
  }
  /**
   * Returns whether this class contains sufficient authorization information.
   */
  public isAuthorized(tokens: AuthData | undefined): boolean {
    return (
      tokens !== undefined &&
      tokens.accessTokenExpire.getTime() > new Date().getTime()
    );
  }

  /**
   * Try to silently authorize it using stored refresh token.
   * If can't suceed it rejects the promise (throws exception).
   */
  public async authorize(tokens: AuthData | undefined): Promise<AuthData> {
    // 1. Maybe we're already authorized.
    if (this.isAuthorized(tokens)) {
      return tokens as AuthData
    }
    // 2. Maybe we can use the refresh token.
    if (tokens != undefined) {
      try {
        tokens = await this.refresh(tokens)
        return tokens
      } catch (error)  {
        if (!(error instanceof KError && error.code == KErrorCode.AuthNoCredentials)) {
          // This is an unexpected error, including network error, 400, 403, or 5XX response, 
          throw error
        }
      }
    }
    // 3. At this point we could try to use the Credentials Management API, but
    // I finally have not done it due to lack of cross-browser compatibility.
    throw new KError(KErrorCode.AuthNoCredentials, "Missing credentials.");
  }

  /**
   * Perform 2-legged authorization using user email and password.
   *
   * @param email The user email
   * @param password The user password
   */
  public async login(email: string, password: string): Promise<AuthData> {
    const tokens = await this.tokenRequest({
      username: email,
      password: password,
      grant_type: "password",
      scope: Auth.SCOPES
    });

    return tokens;
  }

  /**
   * Authenticate using external OpenID Connect provider.
   */
  public async authenticate(provider: "google" | "facebook"): Promise<User> {
    throw new KError(
      KErrorCode.NotImplemented,
      "Authentication with " + provider + "not implemented yet"
    );
  }

  /**
   * Throws KError if the response is not OK.
   * @param response 
   */
  private checkResponse(response: Response) {
    if (!response.ok) {
      if (response.status == 401) {
        throw new KError(
          KErrorCode.AuthNoCredentials,
          "Missing or invalid credentials",
          response
        );
      } else if (response.status == 403) {
        throw new KError(
          KErrorCode.IncorrectCredentials,
          "Access forbidden with given credentials",
          response
        );
      } else if (400 <= response.status && response.status < 500) {
        throw new KError(
          KErrorCode.IncorrectRequest,
          "Invalid request",
          response
        );
      } else {
        throw new KError(KErrorCode.ServerBadResponse, `Server error ${response.status}`, {error: response.statusText});
      }
    }
  }
  /**
   * Load this.userInfo from /UserInfo OIDC endpoint.
   */
  public async getUserInfo(accessToken: string): Promise<User> {
    try {
      const response = await fetch(this.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      this.checkResponse(response)
      const data = await response.json();
      const userInfo = {
        sub: data.sub,
        email: data.email,
        emailVerified: data.email_verified,
        name: data.name,
        preferredUsername: data.preferred_username,
        zoneinfo: data.zoneinfo
      };
      return userInfo;
    } catch (error) {
      throw KError.getKError(error);
    }
  }

  /**
   * Get new access token using saved refresh token.
   */
  private async refresh(tokens: AuthData): Promise<AuthData> {
    if (!tokens) {
      // Should never happen, as callers must be sure that this.data is set.
      throw new KError(KErrorCode.Unknown, "Missing authentication data.");
    }
    return await this.tokenRequest({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken
    });
  }

  /**
   * Perform a request to /token OAuth2 endpoint.
   * @param data The data to be sent. client_id is set automatically.
   */
  private async tokenRequest(data: TokenRequestData): Promise<AuthData> {
    data.client_id = KOptions.oauth.clientid;
    // Use URLSearchParams in order to send the request with x-www-urlencoded.
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => params.append(key, value));
    try {
      const response = await fetch(this.tokenEndpoint, {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      this.checkResponse(response)
      const data = await response.json();
      return this.processTokenResponse(data);
    } catch (error) {
      throw KError.getKError(error);
    }
  }

  /**
   * Handle the response of a request to /token OAuth2 endpoint
   * @param response The response.
   * 
   * Public function just for testing purposes.
   */
  public processTokenResponse(response: TokenResponse): AuthData {
    // Set data object from response.
    const expire = new Date();
    expire.setSeconds(expire.getSeconds() + Number(response.expires_in));

    const data = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      accessTokenExpire: expire,
      scopes: response.scope.split(" ")
    };

    // Save data state.
    LocalStorage.set(Auth.STORAGE_KEY, data);

    return data;
  }
}
