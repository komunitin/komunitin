import { Request } from 'express'

export interface Context {
  /**
   * The context type
   */
  type: "system" | "user" | "external" | "anonymous" | "last-hash"
  /**
   * The user ID of the authenticated user.
   */
  userId?: string
  /**
   * The account public key of the authenticated user.
   */
  accountKey?: string
  lastHashAuth?: {
    ccNodeName: string
    lastHash: string
  }
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
  } else if ("type" in payload && payload.type === "last-hash") {
    console.log('last-hash context');
    return {
      type: payload.type,
      lastHashAuth: {
        ccNodeName: payload.ccNodeName as string,
        lastHash: payload.lastHash as string,
      },
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