
import { logger } from "../utils/logger"
import { createApp } from "./app"

export async function startServer() {
  const app = await createApp()
  const port = process.env.PORT || 2025
  app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`)
  })
}