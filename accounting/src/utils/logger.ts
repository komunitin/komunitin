import pino from "pino"
import pinoHttp from "pino-http"

export const logger = pino({
  name: "accounting",
})

const filterObjectKeys = (obj: Record<string, any> | undefined, keys: string[]) => {
  return obj === undefined ? undefined : Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key))
  )
}

export const httpLogger = pinoHttp({
  logger: pino({name: "http"}),
  serializers: {
    // Dont log all request headers, and specially don't log the credentials.
    req: pino.stdSerializers.wrapRequestSerializer((req) => {
      const {headers, ...rest} = req
      return {
        ...rest,
        headers: filterObjectKeys(req.raw.headers, ["host", "user-agent", "x-forwarded-for", "referer"])
      }
    }),
    // Dont log all response headers.
    res: pino.stdSerializers.wrapResponseSerializer((res: any) => {
      return {
        statusCode: res.raw.statusCode,
        headers: filterObjectKeys(res.raw.headers, ["content-type", "content-length"])
      }
    })
  }
})
