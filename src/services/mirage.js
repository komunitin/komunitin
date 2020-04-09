import { Server } from "miragejs";
import { mockGroup, mockGroupList } from "../pages/groups/models/mockData";
import KOptions from "../komunitin.json";
import { mockToken, mockUserInfo } from "./mockAuth";

console.debug("Mirage activated");

new Server({
  // Take the Base url from mockData.ts
  urlPrefix: KOptions.apis.social,

  routes() {
    // Disable output of all intercepted requests.
    this.logging = false;

    if (process.env.USE_MIRAGE) {
      this.timing = parseInt(process.env.USE_MIRAGE);
    }
    /**
     * List of groups.
     *
     * Ignoring localization, sort, search and pagination query params.
     */
    this.get("/groups", () => mockGroupList());

    /**
     * Full Group
     */
    this.get("/:code", () => mockGroup());

    /**
     * Auth token
     */
    this.post(
      KOptions.apis.auth.issuer + KOptions.apis.auth.token,
      (schema, request) => {
        const params = new URLSearchParams(request.requestBody);
        return mockToken(params.get("scope"))
      },
      200
    );

    /**
     * Auth UserInfo
     */
    this.get(KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo, () =>
      mockUserInfo()
    );

    this.passthrough("/service-worker.js");
  }
});
