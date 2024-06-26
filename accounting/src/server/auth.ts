
import { auth as authJwt, scopeIncludesAny } from "express-oauth2-jwt-bearer"
import { config } from "../config"
import { NextFunction,Request, Response } from "express"
import { fixUrl } from "src/utils/net"

export enum Scope {
  Accounting = "komunitin_accounting",
  AccountingReadAll = "komunitin_accounting_read_all",
}

const jwt = authJwt({
  issuer: config.AUTH_JWT_ISSUER,
  audience: config.AUTH_JWT_AUDIENCE,
  jwksUri: fixUrl(config.AUTH_JWKS_URL),
  validators: {
    // IntegralCES creates JWTs with a null sub claim for the tokens
    // requested by the notifications service. The default validator
    // in express-oauth2-jwt-bearer does not allow null values for 
    // the sub claim.
    sub: (sub) => typeof sub === "string" || sub === null,
  }
})

/**
 * Require a valid JWT token in the request. If the scopes parameter is provided, require also
 * that the JWT includes at least one of the scopes in the parameter.
 * @param scopes 
 * @returns 
 */
export const auth = (scopes?: Scope|Scope[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    jwt(req, res, (err) => {
      if (err) {
        next(err)
      } else if (scopes && scopes.length){
         scopeIncludesAny(scopes)(req, res, next)
      } else {
        next()
      }
    })
  }
}

/**
 * Middleware that allows any request without authentication. 
 * 
 * It does nothig but it helps flag the routes that do not require authentication.
 * */
export const noAuth = () => (req: Request, res: Response, next: NextFunction) => {
  next()
}

