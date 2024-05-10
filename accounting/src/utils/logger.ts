import pino from "pino"
import pinoHttp from "pino-http"

export const logger = pino({
  name: "accounting",
})

export const httpLogger = pinoHttp({
  logger: pino({name: "http"})
})
