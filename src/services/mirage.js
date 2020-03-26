import { Server } from "miragejs";
import {
  mockGroup,
  mockGroupList,
  mockCategoryList
} from "../pages/groups/models/mockData";
import KOptions from "../komunitin.json";

console.debug("Mirage activated");

new Server({
  // Take the Base url from mockData.ts
  urlPrefix: KOptions.apis.social,

  routes() {
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

    this.get("/:code/categories", () => mockCategoryList());
  }
});
