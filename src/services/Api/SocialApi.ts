import axios from "axios";
import { getKError } from "./ApiResources";
import KError, { KErrorCode } from "../../KError";
import KOptions from "../../komunitin.json";
import {
  Group,
  Contact,
  CollectionResponse,
  ResourceResponseInclude,
  Category,
  Offer
} from "../../pages/groups/models/model";

const client = axios.create({
  baseURL: KOptions.apis.social,
  withCredentials: false,
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json"
  }
});

/**
 * Define methods for accessing the information from the Komunitin Social API.
 *
 * See https://app.swaggerhub.com/apis/estevebadia/komunitin-api/
 */
export default {
  /**
   * Get a collection of groups.
   *
   * @param location The latitude and longitude of current user, so groups are sorted by distance from this point.
   * @param search A string so that groups are filtered using this string.
   */
  async getGroups(
    location?: [number, number],
    search?: string
  ): Promise<Group[]> {
    let query = "";
    if (location !== undefined) {
      query += "sort=location&geo-position=" + location[0] + "," + location[1];
    }
    if (search != undefined) {
      query += "filter[search]=" + encodeURIComponent(search);
    }
    if (query.length > 0) {
      query = "?" + query;
    }
    try {
      const response = await client.get<CollectionResponse<Group>>(
        "/groups" + query
      );
      return response.data.data;
    } catch (error) {
      throw getKError(error);
    }
  },

  /**
   * Get the details of a group, including its contacts.
   *
   * @param code The group code (usually 4-letters)
   */
  async getGroupWithContacts(
    code: string
  ): Promise<{ group: Group; contacts: Contact[] }> {
    try {
      // prettier-ignore
      const response = await client
        .get<ResourceResponseInclude<Group, Contact>>("/" + code + "?include=contacts");

      if (response.data.data == null) {
        throw new KError(
          KErrorCode.ResourceNotFound,
          "Resource not found",
          response
        );
      } else {
        return {
          group: response.data.data,
          contacts: response.data.included
        };
      }
    } catch (error) {
      throw getKError(error);
    }
  },

  /**
   * Get the categories of a group.
   *
   * @param code The group code (usually 4-letters)
   * @param filter Filter.
   *        Example: filter[attributes][attributes]=food
   * @param order Order.
   *        Example: sort=-created,title
   *        Example: sort=relationships.offers.meta.count
   * @param pag Number of page.
   *        page[number]
   * @param perPag Number of items.
   *        page[limit]
   *
   * @todo Parse filter: {[field: string]: string, value: string}
   */
  async getCategories(
    code: string,
    filter?: string,
    order?: string,
    pag?: number,
    perPag?: number
  ): Promise<CollectionResponse<Category>> {
    try {
      let query = "/" + code + "/categories";
      let separator = "?";

      if (filter !== undefined) {
        query += separator + filter;
        separator = "&";
      }
      if (order !== undefined) {
        query += separator + order;
        separator = "&";
      }
      if (pag !== undefined) {
        query += separator + "page[number]=" + pag;
        separator = "&";
      }
      if (perPag !== undefined) {
        query += separator + "page[limit]=" + perPag;
        separator = "&";
      }
      const response = await client.get<CollectionResponse<Category>>(query);
      if (response.data.data == null) {
        throw new KError(
          KErrorCode.ResourceNotFound,
          "Resource not found",
          response
        );
      } else {
        return response.data;
      }
    } catch (error) {
      throw getKError(error);
    }
  },

  /**
   * Get a collection of offers.
   *
   * @todo Apply location.
   *
   * @param search A string so that offers are filtered using this string.
   */
  async getOffers(code: string, search?: string): Promise<Offer[]> {
    let query = "";
    if (search != undefined) {
      query += "filter[search]=" + encodeURIComponent(search);
    }
    if (query.length > 0) {
      query = "?" + query;
    }
    try {
      const response = await client.get<CollectionResponse<Offer>>(
        code + "/offers" + query
      );
      return response.data.data;
    } catch (error) {
      throw getKError(error);
    }
  }
};
