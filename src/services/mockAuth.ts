import { TokenResponse, User } from "../plugins/Auth";

export function mockToken(scope: string): TokenResponse {
  return {
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: "test_access_token",
    // eslint-disable-next-line @typescript-eslint/camelcase
    refresh_token: "test_refresh_token",
    // eslint-disable-next-line @typescript-eslint/camelcase
    expires_in: 3600,
    scope: scope
  };
}

export function mockUserInfo(): User {
  return {
    email: "example@example.com",
    emailVerified: true,
    name: "Alice",
    preferredUsername: "Alice",
    sub: '1',
    zoneinfo: "Europe/Madrid"
  }
}