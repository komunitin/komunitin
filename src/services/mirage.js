import { Server } from "miragejs";
import {
  mockGroup,
  mockGroupList,
  mockCategoryList,
  mockCurrency
} from "../pages/groups/models/mockData";
import KOptions from "../komunitin.json";

console.debug("Mirage activated");

const urlSocial = KOptions.apis.social;
const urlAccounting = KOptions.apis.accounting;

new Server({
  // Take the Base url from mockData.ts
  // urlPrefix: KOptions.apis.social,

  routes() {
    if (process.env.USE_MIRAGE) {
      this.timing = parseInt(process.env.USE_MIRAGE);
    }
    /**
     * List of groups.
     *
     * Ignoring localization, sort, search and pagination query params.
     */
    this.get(urlSocial + "/groups", () => mockGroupList());

    /**
     * Full Group
     */
    this.get(urlSocial + "/:code", () => mockGroup());

    /**
     * Categories.
     */
    this.get(urlSocial + "/:code/categories", () => mockCategoryList());

    /**
     * Currency.
     */
    this.get(urlAccounting + "/:code/currencies", () => mockCurrency());
  }
});
