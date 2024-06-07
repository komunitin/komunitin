import { Request } from 'express'

export interface Context {
  /**
   * The context type
   */
  type: "system" | "user"
  /**
   * The user ID of the authenticated user.
   */
  userId?: string
}

export const context = (req: Request): Context => {
  return {
    userId: req.auth?.payload?.sub,
    type: "user"
  }
}

export const systemContext = (): Context => {
  return {
    type: "system",
  }
}