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

  app.use((req, res, next) => {
    // The res.json function will add a "charset=utf-8" to this content type
    // header. This is annoying because it's not needed, but lets keep it.
    res.type('application/vnd.api+json')
    next()
  })
  //logger
  app.use(httpLogger)

  // Routes
  const controller = await createController()
  app.use("/", getRoutes(controller))

  // Error handlers
  app.use(errorHandler)

  return app
}


