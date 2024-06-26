import { Request } from 'express'

export interface Context {
  /**
   * The context type
   */
  type: "system" | "user" | "anonymous"
  /**
   * The user ID of the authenticated user.
   */
  userId?: string
}

export const context = (req: Request): Context => {
  const payload = req.auth?.payload
  if (!payload) {
    return {
      type: "anonymous"
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