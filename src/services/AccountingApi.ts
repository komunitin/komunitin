import axios, { AxiosError } from "axios";
import {
  ErrorObject,
  ResourceResponse,
  Currency
} from "../pages/groups/models/model";
import KError, { KErrorCode } from "../KError";
import KOptions from "../komunitin.json";

const clientAccounting = axios.create({
  baseURL: KOptions.apis.accounting,
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
