import express from "express"
import { getRoutes } from "./routes"
import { createController } from "../controller"

export async function createApp() {
  const app = express()
  
  // Express middlewares
  app.use(express.json({
    type: ['application/vnd.api+json', 'application/json']
  }))

  // Routes
  const controller = await createController()
  app.use("/", getRoutes(controller))

  return app
}


