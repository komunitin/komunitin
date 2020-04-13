import axios from "axios";
import { KOptions } from "../boot/komunitin";
import KError, { KErrorCode } from "src/KError";
//https://quasar.dev/quasar-plugins/web-storage
import { LocalStorage } from "quasar";
import _Vue from "vue";

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

interface AuthData {
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
  private static readonly STORAGE_KEY: string = "auth-session";
  private static readonly REFRESH_BEFORE_EXPIRE: number = 5 * 60;

  private readonly tokenEndpoint: string;
  private readonly userInfoEndpoint: string;

  private data?: AuthData;

  private userInfo?: User;

  constructor(options: AuthOptions) {
    if (LocalStorage.has(Auth.STORAGE_KEY)) {
      this.data = LocalStorage.getItem(Auth.STORAGE_KEY) as AuthData;
    }
    this.tokenEndpoint = options.tokenEndpoint;
    this.userInfoEndpoint = options.userInfoEndpoint;
  }
  /**
   * Returns whether this class contains sufficient authorization information.
   */
  public isAuthorized(): boolean {
    return (
      this.data !== undefined &&
      this.data.accessTokenExpire.getTime() > new Date().getTime()
    );
  }

  /**
   * If the client is not yet authorized, tries to silently authorize it using
   * a stored refresh token. Otherwise rejects the promise (throws exception).
   */
  public async authorize(): Promise<User> {
    if (!this.isAuthorized()) {
      // Either don't have any data or access token is expired.
      if (this.data !== undefined) {
        // Try use refresh token.
        try {
          await this.refresh();
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
    return this.getUserInfo();
  }

  /**
   * Perform 2-legged authorization using user email and password.
   *
   * @param email The user email
   * @param password The user password
   */
  public async login(email: string, password: string): Promise<User> {
    await this.tokenRequest({
      username: email,
      password: password,
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: "password",
      scope: "email komunitin_social offline_access openid profile"
    });
    return this.getUserInfo();
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
   * Load this.userInfo from /UserInfo OIDC endpoint.
   */
  public async getUserInfo(): Promise<User> {
    if (!this.userInfo) {
      const response = await axios.get(this.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${this.data?.accessToken}` }
      });
      this.userInfo = {
        sub: response.data.sub,
        email: response.data.email,
        emailVerified: response.data.email_verified,
        name: response.data.name,
        preferredUsername: response.data.preferred_username,
        zoneinfo: response.data.zoneinfo
      };
    }
    return this.userInfo;
  }

  /**
   * Get new access token using saved refresh token.
   */
  private async refresh() {
    if (!this.data) {
      // Should never happen, as callers must be sure that this.data is set.
      throw new KError(KErrorCode.Unknown, "Missing authentication data.");
    }
    await this.tokenRequest({
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: "refresh_token",
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: this.data.refreshToken
    });
  }

  /**
   * Perform a request to /token OAuth2 endpoint.
   * @param data The data to be sent. client_id is set automatically.
   */
  private async tokenRequest(data: TokenRequestData) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    data.client_id = KOptions.apis.auth.clientId;
    // Use URLSearchParams in order to send the request with x-www-urlencoded.
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => params.append(key, value));
    const response = await axios.post<TokenResponse>(
      this.tokenEndpoint,
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    if (response.status !== 200) {
      throw new KError(
        KErrorCode.ServerBadResponse,
        "Token endpoint returned error.",
        response
      );
    }
    this.processTokenResponse(response.data);
  }

  /**
   * Handle the response of a request to /token OAuth2 endpoint
   * @param data The response.
   */
  private processTokenResponse(data: TokenResponse) {
    // Set data object from response.
    const expire = new Date();
    expire.setSeconds(expire.getSeconds() + data.expires_in);

    this.data = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpire: expire,
      scopes: data.scope.split(" ")
    };

    // Reset user.
    this.userInfo = undefined;

    // Save data state.
    LocalStorage.set(Auth.STORAGE_KEY, this.data);

    // Set next refresh event.
    this.setRefreshEvent();
  }

  /**
   * Schedule a refresh() Auth.REFRESH_BEFORE_EXPIRE seconds before current
   * access token expires.
   */
  private setRefreshEvent(): void {
    if (!this.data) {
      throw new KError(KErrorCode.Unknown, "Missing authentication data.");
    }
    const time = Math.max(
      this.data.accessTokenExpire.getTime() -
        new Date().getTime() -
        Auth.REFRESH_BEFORE_EXPIRE * 1000,
      0
    );
    setTimeout(this.refresh, time);
  }
}

/**
 * Vue plugin functions.
 *
 * Install auth instance into Vue.$auth.
 * @param Vue
 */
export default function(Vue: typeof _Vue, options: AuthOptions) {
  Vue.prototype.$auth = new Auth(options);
}
