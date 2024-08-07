import { logger } from "./logger"
import { sleep } from "./sleep"

/**
 * Implements a simple rate limiter that limits the number of concurrent executions of a function
 * in a time window. Note that this function uses fixed time window slots so the actual maximum
 * rate per specified time window may be up to twice the specified rate.
 * 
 * @param maxNumber The maximum number of concurrent executions in a time window.
 * @param timeWindow The time window in milliseconds.
 * @returns 
 */
export const rateLimitRunner = (maxNumber: number, timeWindow: number) => {
  let started = 0
  let running = 0
  let lastSlotStart = Date.now()
  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    const now = Date.now()
    if (now - lastSlotStart > timeWindow) {
      started = running
      lastSlotStart = now
      logger.debug(`New window, ${running} running`)
    }
    if (started >= maxNumber) {
      // The implementation of setTimeout by Node guarantees that the order of execution is preserved.
      // Concretely it compares first the scheduled times and then the order of insertion.
      logger.debug(`Rate limit reached, waiting for next time window`)
      await sleep(lastSlotStart + timeWindow - now + 1)
      logger.debug(`Awake from waiting`)
      return await run(fn)
    }
    
    started++
    running++
    try {
      logger.debug(`Running task  ${started} of ${maxNumber}, ${running} parallel`)
      return await fn()  
    } finally {
      running--
    }
  }
  return {
    run
  }

}