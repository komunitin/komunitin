import { describe, it } from "node:test"
import assert from "node:assert"

import { setupServerTest } from './setup'
import { testTransfer } from "./api.data"
import { setConfig } from "src/config"
import { logger } from "src/utils/logger"
import { sleep } from "src/utils/sleep"

logger.level = "debug"

describe('Runs multiple transfers in parallel', async () => {
  // Wait for other tests/requests to stop counting in Horizon rate limit.
  const wait5secPromise = sleep(6000)
  setConfig({
    STELLAR_CHANNEL_ACCOUNTS_ENABLED: true
  })
  const t = setupServerTest()
  await it('100 transfers at once', async () => {
    
    const data = Array.from({length: 100}, (_, i) => {
      const doc = testTransfer(t.account1.id, t.account2.id, 5, `Transfer ${i}`, "committed")
      return doc.data
    })
    await wait5secPromise
    const response = await t.api.post('/TEST/transfers', { data }, t.user1, 201)
    const transfers = response.body.data
    assert.equal(transfers.length, 100)
    // Check balances
    const account1 = await t.api.get(`/TEST/accounts/${t.account1.id}`, t.user1)
    assert.equal(account1.body.data.attributes.balance, -500)
    const account2 = await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user1)
    assert.equal(account2.body.data.attributes.balance, 500)

  })
})