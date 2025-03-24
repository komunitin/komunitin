import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest } from "./setup"
import { testCreditCommonsTransaction } from "./api.data"

describe('Transaction endpoint', async () => {
  // Creates a currency and a few accounts.
  const t = setupServerTest()

  it('Requires the cc-node header', async () => {
    const response = await t.api.post("/cc/TEST/transaction", {}, undefined, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"cc-node header is required."}]}')
  })

  it('Requires the last-hash header', async () => {
    const response = await t.api.post("/cc/TEST/transaction", {}, { user: null, scopes: [], ccNode: 'trunk' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"last-hash header is required."}]}')
  })

  it('Checks the last-hash header [TODO: against the db]', async () => {
    const response = await t.api.post("/cc/TEST/transaction", {}, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'qwer' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"value of last-hash header \\"qwer\\" does not match our records."}]}')
  })

  it('Checks the cc-node header [TODO: against the db]', async () => {
    const response = await t.api.post("/cc/TEST/transaction", {}, { user: null, scopes: [], ccNode: 'bla', lastHash: 'asdf' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"cc-node \\"bla\\" is not our trunkward node."}]}')
  })

  it('Receives CC transactions', async () => { 
    const response = await t.api.post(
      "/cc/TEST/transaction",
      testCreditCommonsTransaction('alice', 'trunk/bob', 1.0),
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'asdf' },
      201)
    assert.equal(response.body.message, undefined) // 'Welcome to the Credit Commons federation protocol.')
  })
  

})