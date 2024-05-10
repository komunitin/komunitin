// Check error codes in ices komunitin server.
export enum KErrorCode {
  BadRequest = "BadRequest",
  BadConfig = "BadConfig",
  NotFound = "NotFound",
  InternalError = "InternalError",
  BadTransaction = "BadTransaction",
  NotImplemented = "NotImplemented",
  FieldValidationError = "FieldValidationError"
}

const errorDefinitions: Record<KErrorCode, [number, string]> = {
  [KErrorCode.BadRequest]: [400, "Bad Request"],
  [KErrorCode.BadTransaction]: [400, "Transaction Error"],
  [KErrorCode.NotFound]: [404, "Not Found"],
  [KErrorCode.BadConfig]: [500, "Bad Configuration"],
  [KErrorCode.NotImplemented]: [500, "Not Implemented"],
  [KErrorCode.InternalError]: [500, "Internal Error"],
  [KErrorCode.FieldValidationError]: [400, "Field validation Error"]
} as const

const status = (code: KErrorCode) => errorDefinitions[code][0]
const title = (code: KErrorCode) => errorDefinitions[code][1]



export class KError extends Error {
  public readonly code: KErrorCode

  constructor(code: KErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    this.code = code
  }

  public getStatus() {
    return status(this.code)
  }

  public getTitle() {
    return title(this.code)
  }
}

export const badConfig = (message: string) => new KError(KErrorCode.BadConfig, message)
export const badRequest = (message: string, cause?: unknown) => new KError(KErrorCode.BadRequest, message, { cause })
export const internalError = (message: string, cause?: unknown) => new KError(KErrorCode.InternalError, message, { cause })
export const notFound = (message: string) => new KError(KErrorCode.NotFound, message)
export const notImplemented = (message: string, cause?: unknown) => new KError(KErrorCode.NotImplemented, message, { cause })
export const badTransaction = (message: string, cause?: unknown) => new KError(KErrorCode.BadTransaction, message, { cause })
export const fieldValidationError = (message: string, cause?: unknown) => new KError(KErrorCode.FieldValidationError, message, { cause })