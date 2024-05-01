import pino from "pino"

export const logger = pino({
  name: "tester"
})

export const friendbot = async (publicKey: string) => {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`)
    await response.json()
    logger.info(`Account ${publicKey} funded with 10,000 XLM on the test network.`)
  } catch (e) {
    logger.error("Error funding account", e)
  }
}
