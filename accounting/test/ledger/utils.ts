import { retry } from "src/utils/sleep"
import { logger } from "../../src/utils/logger"
import { TestConfig } from "test/config"


export const friendbot = async (publicKey: string) => {
  try {
    await retry(async() => {
      const response = await fetch(`${TestConfig.STELLAR_FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
      if (!response.ok) {
        logger.warn(response, "Error response from friendbot. Retrying...")
        throw new Error("Error funding account")
      }
      await response.json()
      logger.info(`Account ${publicKey} funded with 10,000 XLM on the test network.`)
    }, 30000, 1000)
  } catch (e) {
    logger.error("Error funding account", e)
  }
}
