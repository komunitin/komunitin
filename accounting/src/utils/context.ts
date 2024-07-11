import { Request } from 'express'

export interface Context {
  /**
   * The context type
   */
  type: "system" | "user" | "external" | "anonymous"
  /**
   * The user ID of the authenticated user.
   */
  userId?: string
  /**
   * The account public key of the authenticated user.
   */
  accountKey?: string
}

export const context = (req: Request): Context => {
  const payload = req.auth?.payload
  if (!payload) {
    return {
      type: "anonymous"
    }
  // This case happens when the token is the "external jwt" token
  } else if ("type" in payload && payload.type === "external") {
    return {
      type: "external",
      accountKey: payload.sub
    }
  } else if (typeof payload.sub === "string") {
    return {
      userId: payload.sub,
      type: "user"
    }
  // This case happens when the notifications service uses the service.
  } else if (payload.sub === null) {
    return {
      type: "system"
    }
  } else {
    throw new Error("Invalid sub claim in JWT")
  }
}

export const systemContext = (): Context => {
  return {
    type: "system",
  }
}