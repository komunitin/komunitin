import axios, { AxiosError } from "axios";
import { KOptions } from "../boot/komunitin";
import KError, { KErrorCode } from "src/KError";
//https://quasar.dev/quasar-plugins/web-storage
import { LocalStorage } from "quasar";

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
  public static readonly SCOPES = "email komunitin_social offline_access openid profile";

  private readonly tokenEndpoint: string;
  private readonly userInfoEndpoint: string;

  constructor(options: AuthOptions) {
    this.tokenEndpoint = options.tokenEndpoint;
    this.userInfoEndpoint = options.userInfoEndpoint;
  }

  /**
   * Retrieve AuthData stored in LocalStorage.
   */
  public getStoredTokens(): AuthData | undefined {
    if (LocalStorage.has(Auth.STORAGE_KEY)) {
      const data = LocalStorage.getItem(Auth.STORAGE_KEY) as {accessTokenExpire: string | Date};
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
    if (LocalStorage.has(Auth.STORAGE_KEY)) {
      LocalStorage.remove(Auth.STORAGE_KEY);
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
   * If the client is not yet authorized, tries to silently authorize it using
   * a stored refresh token. Otherwise rejects the promise (throws exception).
   */
  public async authorize(tokens: AuthData | undefined): Promise<AuthData> {
    if (!this.isAuthorized(tokens)) {
      // Either don't have any data or access token is expired.
      if (tokens !== undefined) {
        // Try use refresh token.
        try {
          tokens = await this.refresh(tokens);
        } catch (error) {
          throw new KError(
            KErrorCode.AuthNoCredentials,
            "Credentails are no longer valid, login again."
          );
        }
      } else {
        throw new KError(KErrorCode.AuthNoCredentials, "Missing credentials.");
      }
    }
    return tokens as AuthData;
  }

  /**
   * Perform 2-legged authorization using user email and password.
   *
   * @param email The user email
   * @param password The user password
   * 
   * Throws exception / rejects promise on invalid credentials.
   */
  public async login(email: string, password: string): Promise<AuthData> {
    return this.tokenRequest({
      username: email,
      password: password,
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: "password",
      scope: Auth.SCOPES
    });
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

  private getKError(error: AxiosError): KError {
    if (error.response) {
      const status = error.response.status;
      if (status == 401) {
        return new KError(
          KErrorCode.AuthNoCredentials,
          "Missing or invalid credentials",
          error
        );
      } else if (status == 403) {
        return new KError(
          KErrorCode.IncorrectCredentials,
          "Access forbidden with given credentials",
          error
        );
      } else if (400 <= status && status < 500) {
        return new KError(
          KErrorCode.IncorrectRequest,
          "Invalid request",
          error
        );
      } else {
        return new KError(KErrorCode.ServerBadResponse, "Server error", error);
      }
    } else if (error.isAxiosError) {
      return new KError(KErrorCode.ServerNoResponse, error.message, error);
    } else {
      return new KError(KErrorCode.UnknownScript, "Unexpected error", error);
    }
  }
  /**
   * Load this.userInfo from /UserInfo OIDC endpoint.
   */
  public async getUserInfo(accessToken: string): Promise<User> {
    try {
      const response = await axios.get(this.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = {
        sub: response.data.sub,
        email: response.data.email,
        emailVerified: response.data.email_verified,
        name: response.data.name,
        preferredUsername: response.data.preferred_username,
        zoneinfo: response.data.zoneinfo
      };
      return userInfo;
    } catch (error) {
      throw this.getKError(error as AxiosError);
    }
  }

  /**
   * Get new access token using saved refresh token.
   */
  private async refresh(tokens: AuthData) {
    if (!tokens) {
      // Should never happen, as callers must be sure that this.data is set.
      throw new KError(KErrorCode.Unknown, "Missing authentication data.");
    }
    return this.tokenRequest({
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: "refresh_token",
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: tokens.refreshToken
    });
  }

  /**
   * Perform a request to /token OAuth2 endpoint.
   * @param data The data to be sent. client_id is set automatically.
   * 
   * Throws exception on invalid credentials.
   */
  private async tokenRequest(data: TokenRequestData): Promise<AuthData> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    data.client_id = KOptions.oauth.clientid;
    // Use URLSearchParams in order to send the request with x-www-urlencoded.
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => params.append(key, value));
    try {
      const response = await axios.post<TokenResponse>(
        this.tokenEndpoint,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      return this.processTokenResponse(response.data);
    } catch (error) {
      throw this.getKError(error as AxiosError);
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
    expire.setSeconds(expire.getSeconds() + response.expires_in);

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
