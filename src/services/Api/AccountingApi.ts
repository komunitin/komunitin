import axios from "axios";
import KError, { KErrorCode } from "../../KError";
import { getKError } from "./ApiResources";
import { ResourceResponse, Currency } from "../../pages/groups/models/model";
import KOptions from "../../komunitin.json";

const clientAccounting = axios.create({
  baseURL: KOptions.apis.accounting,
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
   * Find currency status.
   *
   * ${KOptions.apis.accounting}/${code}/currency
   *
   * @todo Aplly API urls.
   *
   * @param code The group code (usually 4-letters)
   *
   */
  async getCurrencyStats(code: string): Promise<Currency> {
    try {
      // prettier-ignore
      const response = await clientAccounting
        .get<ResourceResponse<Currency>>("/" + code + "/currency");

      if (response.data.data == null) {
        throw new KError(
          KErrorCode.ResourceNotFound,
          "Resource not found",
          response
        );
      } else {
        return response.data.data;
      }
    } catch (error) {
      throw getKError(error);
    }
  }
};
