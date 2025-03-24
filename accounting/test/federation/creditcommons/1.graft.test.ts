import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest } from "../../server/setup"

describe('last-hash auth', async () => {
  // This calls /cc/TEST/graft and adds a trunkward neighbour 'trunk' with last-hash 'asdf':
  const t = setupServerTest()

  it('Requires the cc-node header', async () => {
    const response = await t.api.get("/cc/TEST/", undefined, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"cc-node header is required."}]}')
  })

  it('Requires the last-hash header', async () => {
    const response = await t.api.get("/cc/TEST/", { user: null, scopes: [], ccNode: 'trunk' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"last-hash header is required."}]}')
  })

  it('Checks the last-hash header', async () => {
    const response = await t.api.get("/cc/TEST/", { user: null, scopes: [], ccNode: 'trunk', lastHash: 'qwer' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"value of last-hash header \\"qwer\\" does not match our records."}]}')
  })

  it('Checks the cc-node header', async () => {
    const response = await t.api.get("/cc/TEST/", { user: null, scopes: [], ccNode: 'bla', lastHash: 'asdf' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"cc-node \\"bla\\" is not our trunkward node."}]}')
  })

  it('Allows access with the right grafted creds', async () => {
    const response = await t.api.get(
      "/cc/TEST/",
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'asdf' },
      200)
    assert.equal(response.body.data.attributes.message, 'Welcome to the Credit Commons federation protocol.')
  })
  

})