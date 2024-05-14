import express from "express"
import { getRoutes } from "./routes"
import { createController } from "../controller"
import { errorHandler } from "./errors"
import { httpLogger } from "../utils/logger"
import qs from "qs"

export async function createApp() {
  const app = express()
  app.set('query parser', (query: string) => {
    return qs.parse(query, {
      // parse comma-separated values into arrays.
      comma: true
    })
  })
  // Express middlewares
  app.use(express.json({
    type: ['application/vnd.api+json', 'application/json']
  }))
  //logger
  app.use(httpLogger)

  // Routes
  const controller = await createController()
  app.use("/", getRoutes(controller))

  // Error handlers
  app.use(errorHandler)

  return app
}


