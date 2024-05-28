import { logger } from "../utils/logger";
import { KError, badRequest, fieldValidationError, forbidden, internalError, unauthorized } from "../utils/error"
import type { ErrorRequestHandler } from "express";
import { UnauthorizedError } from "express-oauth2-jwt-bearer"

// JSON Api error object.
interface ErrorObject {
  errors: {
    status: string
    code: string
    title: string
    detail: string
  }[]
}

const errorObject = (kerror: KError) : ErrorObject => {
  return {
    errors: [{
      status: kerror.getStatus().toString(),
      code: kerror.code,
      title: kerror.getTitle(),
      detail: kerror.message
    }]
  }
}

const getKError = (error: any): KError => {
  // App error.
  if (error instanceof KError) {
    return error
  // express-validator error. Return only the first one.
  } else if (error.errors && Array.isArray(error.errors) 
    && error.errors.length > 0 && error.errors[0].type 
    && error.errors[0].msg) {
    const first = error.errors[0]
    if (first.type === "field") {
      return fieldValidationError(`Field ${first.path} is invalid in request ${first.location}.`, error.errors)
    } else {
      return badRequest(error.msg, error.errors)
    }
  // authorization errors
  } else if (error instanceof UnauthorizedError) {
    if (error.status === 400) {
      return badRequest(error.message, error)
    } else if (error.status === 401) {
      return unauthorized(error.message)
    } else if (error.status === 403) {
      return forbidden(error.message)
    } else {
      return internalError(error.message, error)
    }
  // general unexpected errors
  } else if (error instanceof Error) {
    return internalError(error.message, error)
  } else {
    return internalError("Unexpected error", error)
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err)
  const kerror = getKError(err)
  const errorObj = errorObject(kerror)
  res.status(kerror.getStatus()).json(errorObj)
}