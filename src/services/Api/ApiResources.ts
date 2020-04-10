import { AxiosError } from "axios";
import KError, { KErrorCode } from "../../KError";

import { ErrorObject } from "../../pages/groups/models/model";

/**
 * Re-throw a KError with the proper code.
 *
 * @param error The error object from Axios library.
 */
export function getKError(error: AxiosError<ErrorObject>) {
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
