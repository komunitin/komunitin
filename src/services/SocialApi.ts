import axios, { AxiosError } from "axios";
import {
  Group,
  Contact,
  GroupSummary,
  CollectionResponse,
  ErrorObject,
  ResourceResponseInclude,
  Category
} from "../pages/groups/models/model";
import KError, { KErrorCode } from "../KError";
import KOptions from "../komunitin.json";

const client = axios.create({
  baseURL: KOptions.apis.social,
  withCredentials: false,
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json"
  }
});

/**
 * Re-throw a KError with the proper code.
 *
 * @param error The error object from Axios library.
 */
function getKError(error: AxiosError<ErrorObject>) {
  if (error.response) {
    // Server returned error. Use code from server response.
    const apiError = error.response.data;
    // Check that the code is actually known.
    const code =
      apiError.code in KErrorCode
        ? (apiError.code as KErrorCode)
        : KErrorCode.UnknownServer;

    return new KError(code, apiError.title, error);
  } else if (error.request) {
    // Server didn't respond.
    return new KError(KErrorCode.ServerNoResponse, error.message, error);
  } else {
    // Request could not be prepared.
    return new KError(KErrorCode.IncorrectRequest, error.message, error);
  }
}

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
  ): Promise<GroupSummary[]> {
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
      const response = await client.get<CollectionResponse<GroupSummary>>(
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
      const response = await client.get<
        ResourceResponseInclude<Group, Contact>
      >("/" + code + "?include=contacts");
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
  }
};
