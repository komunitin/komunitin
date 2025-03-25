import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest } from "../server/setup"
import { userAuth, testCreditCommonsNeighbour } from "../server/api.data"

describe('grafting', async () => {
  // This sets up the server with the TEST currency but doesn't add a trunkward neighbour:
  const t = setupServerTest(true, false)

  it('is required', async () => {
    const response = await t.api.get(
      "/TEST/cc/",
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'asdf' },
      401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"This currency has not (yet) been grafted onto any CreditCommons tree."}]}')
  })
  it('requires authn', async () => {
    const response = await t.api.post(
      "/TEST/creditCommonsNodes",
      testCreditCommonsNeighbour( 'trunk', 'asdf'),
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'asdf' },
      403)
    assert.equal(response.text, '{"errors":[{"status":"403","code":"Forbidden","title":"Forbidden","detail":"Insufficient Scope"}]}')
  })
  it('requires admin', async () => {
    const response = await t.api.post(
      "/TEST/creditCommonsNodes",
      testCreditCommonsNeighbour( 'trunk', 'asdf'),
      userAuth("1"),
      403)
    assert.equal(response.text, '{"errors":[{"status":"403","code":"Forbidden","title":"Forbidden","detail":"Only the currency owner can perform this operation"}]}')
  })
  it('can be done', async () => {
    const response = await t.api.post(
      "/TEST/creditCommonsNodes",
      testCreditCommonsNeighbour( 'trunk', 'asdf'),
      userAuth("0"),
      201)
    assert.equal(response.text, '{"data":{"type":"creditCommonsNodes","attributes":{"ccNodeName":"trunk","lastHash":"asdf"}}}')
  })

})
