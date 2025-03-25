import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest, TestSetupWithCurrency } from "../server/setup"
import { testCreditCommonsTransaction } from "../server/api.data"

const generateCcTransaction = (t: TestSetupWithCurrency) => testCreditCommonsTransaction({
  cheat: t.account0.id,
  uuid: '3d8ebb9f-6a29-42cb-9d39-9ee0a6bf7f1c',
  state: 'V',
  workflow: '|P-PC+CX+',
  entries: [
      {
      payee: `trunk/branch2/${t.account2.id}`,
      payer: 'trunk/branch/twig/alice',
      quant: 432,
      description: 'test long distance for 3 from leaf',
      metadata: { foo: 'bar' }
      },
      {
      payee: 'trunk/branch/twig/admin',
      payer: `trunk/branch2/${t.account2.id}`,
      quant: 144,
      description: 'Payee fee of 1 to twig/admin',
      metadata: {}
      },
      {
      payee: 'trunk/branch/admin',
      payer: `trunk/branch2/${t.account2.id}`,
      quant: 6,
      description: 'Payee fee of 1 to branch/admin',
      metadata: {}
      },
      {
      payee: 'trunk/admin',
      payer: `trunk/branch2/${t.account2.id}`,
      quant: 1,
      description: 'Payee fee of 1 to trunk/admin',
      metadata: {}
      }
  ]
})

describe('receive', async () => {
  // This calls /TEST/creditCommonsNodes and adds a trunkward neighbour 'trunk' with last-hash 'trunk':
  const t = setupServerTest(true, true)

  it('Checks the last-hash header', async () => {
    const ccTransaction = generateCcTransaction(t)
    const response = await t.api.post("/TEST/cc/transaction", ccTransaction, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'qwer' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"value of last-hash header \\"qwer\\" does not match our records."}]}')
  })

  it('Updates the balances', async () => {
    const ccTransaction = generateCcTransaction(t)
    // Check balances before
    t.account0 = (await t.api.get(`/TEST/accounts/${t.account0.id}`, t.admin)).body.data
    assert.equal(t.account0.attributes.balance, 0)
    t.account2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data
    assert.equal(t.account2.attributes.balance, 0)
    const response = await t.api.post(
      "/TEST/cc/transaction",
      ccTransaction,
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' },
      201)
    assert.equal(JSON.stringify(response.body.data.attributes, null, 2), JSON.stringify(ccTransaction.data.attributes, null, 2))
    const expectedNetGain = 432 - 144 - 6 - 1
    // Check balances after
    t.account0 = (await t.api.get(`/TEST/accounts/${t.account0.id}`, t.admin)).body.data
    assert.equal(t.account0.attributes.balance, -expectedNetGain)
    t.account2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data
    assert.equal(t.account2.attributes.balance, expectedNetGain)
  })
})