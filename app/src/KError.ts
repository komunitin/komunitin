export enum KErrorCode {
  Unknown = "Unknown",
  IncorrectRequest = "IncorrectRequest",
  ServerNoResponse = "ServerNoResponse",
  ServerBadResponse = "ServerBadResponse",
  ResourceNotFound = "ResourceNotFound",
  UnknownServer = "UnknownServer",
  UnknownVueError = "UnknownVueError",
  UnknownScript = "UnknownScript",
  ErrorHandling = "ErrorHandling",
  PositionTimeout = "PositionTimeout",
  PositionUnavailable = "PositionUnavailable",
  PositionPermisionDenied = "PositionPermisionDenied",
  NotificationsPermissionDenied = "NotificationsPermissionDenied",
  VueWarning = "VueWarning",
  IncorrectCredentials = "IncorrectCredentials",
  AuthNoCredentials = "AuthNoCredentials",
  NotImplemented = "NotImplemented",
  RequestError = "RequestError",
  InvalidTransferState = "InvalidTransferState",
  /**
   * This condition should not happen and it indicates a programming bug
   * that needs to be solved by the development team. Use it to assert complex
   * conditions.
   */
  ScriptError = "ScriptError",
  UserLoggingOut = "UserLoggingOut"
}

/**
 * Error class with code and additional information.
 */
export default class KError extends Error {
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debugInfo: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(code = KErrorCode.Unknown, message = "", debugInfo?: any) {
    super(message);
    this.code = code;
    this.debugInfo = debugInfo !== undefined ? debugInfo : null;
  }
  /**
   * Return the localized message.
   */
  getTranslationKey(): string {
    return "Error" + this.code;
  }

  /**
  * Get a KError from a fetch error.
  * @param error The error.
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getKError(error: any): KError {
    if (error instanceof KError) {
      return error;
    } else {
      return new KError(KErrorCode.UnknownScript, "Unexpected error", error);
    }
  }
}
