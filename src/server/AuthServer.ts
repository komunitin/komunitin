import KOptions from "../komunitin.json";
import { TokenResponse, User } from "../plugins/Auth";
import { Server, Response } from "miragejs";

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

function mockUserInfo(): User {
  return {
    email: "example@example.com",
    emailVerified: true,
    name: "Alice",
    preferredUsername: "Alice",
    sub: '1',
    zoneinfo: "Europe/Madrid"
  }
}

/**
 * Object containing the properties to create a MirageJS server that mocks an OAuth2 
 * server with features needed by the Komunitin app.
 */
export default {
  routes(server: Server) {
    // OAuth2 token
    server.post(
      KOptions.apis.auth.issuer + KOptions.apis.auth.token,
      (schema, request) => {
        const params = new URLSearchParams(request.requestBody);
        const data = mockToken(params.get("scope") as string);
        return new Response(200, {}, data);
      }
    );

    /**
     * Auth UserInfo
     */
    server.get(KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo, () =>
      mockUserInfo()
    );
  }
};
