import express from "express"
import { getRoutes } from "./routes"
import { createController } from "../controller"
import { errorHandler } from "./errors"
import { httpLogger } from "../utils/logger"

export async function createApp() {
  const app = express()
  
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


