import { Response } from "express"
import { Result, ValidationError } from "express-validator"

namespace Errors {
  export const Validation = (detail: string) => ({
    status: "400",
    code: "ValidationError",
    title: "Validation Error",
    detail
  })

  export const Empty = () => ({
    status: "500",
    code: "InternalServerError",
    title: "Internal Server Error",
    detail: "Unexpected empty error object."
  })
}

// JSON Api error object.
interface ErrorObject {
  errors: {
    status: string
    code: string
    title: string
    detail: string
  }[]
}

const validationError = (errors: Result<ValidationError>): ErrorObject => {
  return {
    errors: errors.array().map(error => Errors.Validation(error.msg))
  }
}

export const sendValidationError = (res: Response, errors: Result<ValidationError>) => {
  sendError(res, validationError(errors))
}

export const sendError = (res: Response, error: ErrorObject) => {
  if (!error.errors || error.errors.length === 0) {
    error.errors = [Errors.Empty()]
  }
  res.status(parseInt(error.errors[0].status)).json(error)
}