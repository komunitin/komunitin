import { Server } from "miragejs";
import {
  mockGroup,
  mockGroupList,
  mockCategoryList,
  mockCurrency,
  mockOfferList
} from "../pages/groups/models/mockContent/mockData";
import KOptions from "../komunitin.json";

console.debug("Mirage activated");

const urlSocial = KOptions.apis.social;
const urlAccounting = KOptions.apis.accounting;

new Server({
  // Take the Base url from mockData.ts

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
    this.get(urlSocial + "/:code", (schema, request) =>
      mockGroup(request.params.code)
    );

    /**
     * Categories.
     */
    this.get(urlSocial + "/:code/categories", (schema, request) =>
      mockCategoryList(request.params.code)
    );

    /**
     * Currency.
     */
    this.get(urlAccounting + "/:code/currency", (schema, request) =>
      mockCurrency(request.params.code)
    );

    /**
     * Offers list.
     */
    this.get(urlSocial + "/:code/offers", (schema, request) =>
      mockOfferList(request.params.code)
    );
  }
});
