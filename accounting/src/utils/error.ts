// Check error codes in ices komunitin server.
export enum KErrorCode {
  BadRequest = "BadRequest",
  BadConfig = "BadConfig",
  NotFound = "NotFound",
  InternalError = "InternalError",
  NotImplemented = "NotImplemented",
  FieldValidationError = "FieldValidationError",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  TransactionError = "TransactionError",
  InsufficientBalance = "InsufficientBalance",
  NoTrustPath = "NoTrustPath",
}

const errorDefinitions: Record<KErrorCode, [number, string]> = {
  [KErrorCode.BadRequest]: [400, "Bad Request"],
  [KErrorCode.TransactionError]: [400, "Transaction Error"],
  [KErrorCode.NotFound]: [404, "Not Found"],
  [KErrorCode.BadConfig]: [500, "Bad Configuration"],
  [KErrorCode.NotImplemented]: [500, "Not Implemented"],
  [KErrorCode.InternalError]: [500, "Internal Error"],
  [KErrorCode.FieldValidationError]: [400, "Field validation Error"],
  [KErrorCode.Unauthorized]: [401, "Unauthorized"],
  [KErrorCode.Forbidden]: [403, "Forbidden"],
  [KErrorCode.InsufficientBalance]: [400, "Insufficient Balance"],
  [KErrorCode.NoTrustPath]: [400, "No trust path between currencies"],
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
export const transactionError = (message: string, cause?: unknown) => new KError(KErrorCode.TransactionError, message, { cause })
export const fieldValidationError = (message: string, cause?: unknown) => new KError(KErrorCode.FieldValidationError, message, { cause })
export const unauthorized = (message: string) => new KError(KErrorCode.Unauthorized, message)
export const forbidden = (message: string) => new KError(KErrorCode.Forbidden, message)
export const insufficientBalance = (message: string) => new KError(KErrorCode.InsufficientBalance, message)
export const noTrustPath = (message: string) => new KError(KErrorCode.NoTrustPath, message)