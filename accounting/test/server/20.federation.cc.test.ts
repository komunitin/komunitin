import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest } from "./setup"

describe('Federation', async () => {
  // Creates a currency and a few accounts.
  const t = setupServerTest()

  it('Receives CC transactions', async () => {
    const response = await t.api.post("/cc/transaction", {}, undefined, 200)
    assert.equal(response.body.message, 'Welcome to the Credit Commons federation protocol.')
  })
  

})