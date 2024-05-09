import { retry } from "../../utils/sleep"
import { logger } from "../../utils/logger"

export const friendbot = async (url: string, publicKey: string) => {
  try {
    await retry(async() => {
      const response = await fetch(`${url}?addr=${encodeURIComponent(publicKey)}`)
      if (!response.ok) {
        logger.warn(response, "Error response from friendbot. Retrying...")
        throw new Error("Error funding account")
      }
      await response.json()
      logger.info(`Account ${publicKey} funded with 10,000 XLM with friendbot.`)
    }, 30000, 1000)
  } catch (e) {
    logger.error("Error funding account", e)
  }
}