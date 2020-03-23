
export enum KErrorCode {
  Unknown = 'Unknown',
  IncorrectRequest = "IncorrectRequest",
  ServerNoResponse = "ServerNoResponse",
  ResourceNotFound = "ResourceNotFound",
  UnknownServer = "UnknownServer",
  UnknownVueError = "UnknownVueError",
  UnknownScript = "UnknownScript",
  ErrorHandling = "ErrorHandling",
  PositionTimeout = "PositionTimeout",
  PositionUnavailable = "PositionUnavailable",
  PositionPermisionDenied = "PositionPermisionDenied",
  VueWarning = "VueWarning"
}

/**
 * Error class with code and additional information.
 */
export default class KError extends Error {
  code: string
  debugInfo: object | null

  constructor(code = KErrorCode.Unknown, message = '', debugInfo?: object) {
    super(message);
    this.code = code;
    this.debugInfo = (debugInfo !== undefined) ? debugInfo : null;
  }
  /**
   * Return the localized message. 
   */
  getTranslationKey() {
    return 'Error' + this.code;
  }

}