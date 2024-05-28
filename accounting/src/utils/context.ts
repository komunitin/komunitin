import { Request } from 'express'

export interface Context {
  /**
   * The user ID of the authenticated user.
   */
  userId?: string
}

export const context = (req: Request): Context => {
  return {
    userId: req.auth?.payload?.sub,
  }
}