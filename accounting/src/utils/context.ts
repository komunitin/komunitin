import { Request } from 'express'

export interface Context {
  userId?: string
}

export const context = (req: Request): Context => {
  return {
    userId: req.auth?.payload?.sub
  }
}