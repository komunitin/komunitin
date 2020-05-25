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
  VueWarning = "VueWarning",
  IncorrectCredentials = "IncorrectCredentials",
  AuthNoCredentials = "AuthNoCredentials",
  NotImplemented = "NotImplemented",
  RequestError = "RequestError",
  /**
   * This condition should not happen and it indicates a programming bug 
   * that needs to be solved by the development team. Use it to assert complex
   * conditions.
   */
  ScriptError = "ScriptError"
}

/**
 * Error class with code and additional information.
 */
export default class KError extends Error {
  code: string;
  debugInfo: object | null;

  constructor(code = KErrorCode.Unknown, message = "", debugInfo?: object) {
    super(message);
    this.code = code;
    this.debugInfo = debugInfo !== undefined ? debugInfo : null;
  }
  /**
   * Return the localized message.
   */
  getTranslationKey() {
    return "Error" + this.code;
  }
}
