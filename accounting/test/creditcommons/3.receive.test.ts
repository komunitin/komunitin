import {describe, it} from "node:test"
import assert from "node:assert"
import { setupServerTest, TestSetupWithCurrency } from "../server/setup"
import { setConfig } from "src/config"
import { sleep } from "src/utils/sleep"

const generateCcTransaction = (t: TestSetupWithCurrency) => ({
  uuid: '3d8ebb9f-6a29-42cb-9d39-9ee0a6bf7f1c',
  state: 'V',
  workflow: '|P-PC+CX+',
  entries: [
      {
      payee: `trunk/branch2/TEST0002`,
      payer: 'trunk/branch/twig/alice',
      quant: 14,
      description: 'test long distance for 3 from leaf',
      metadata: { foo: 'bar' }
      },
      {
      payee: 'trunk/branch/twig/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 2,
      description: 'Payee fee of 1 to twig/admin',
      metadata: {}
      },
      {
      payee: 'trunk/branch/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 3,
      description: 'Payee fee of 1 to branch/admin',
      metadata: {}
      },
      {
      payee: 'trunk/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 1,
      description: 'Payee fee of 1 to trunk/admin',
      metadata: {}
      }
  ]
})

describe('receive', async () => {
  // copied from https://github.com/komunitin/komunitin/blob/273b3a136d9bc4a7f36ced9343a989eb6d15630e/accounting/test/server/9.multiple.transfer.api.test.ts#L13-L17
  // Wait for other tests/requests to stop counting in Horizon rate limit.
  const wait5secPromise = sleep(6000)
  setConfig({
    STELLAR_CHANNEL_ACCOUNTS_ENABLED: true
  })
  
  // This calls /TEST/creditCommonsNodes and adds a trunkward neighbour 'trunk' with last-hash 'trunk':
  const t = setupServerTest(true, true)

  it('Checks the last-hash header', async () => {
    const ccTransaction = generateCcTransaction(t)
    const response = await t.api.post("/TEST/cc/transaction/relay", ccTransaction, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'qwer' }, 401)
    assert.equal(response.text, '{"errors":[{"status":"401","code":"Unauthorized","title":"Unauthorized","detail":"value of last-hash header \\"qwer\\" does not match our records."}]}')
  })

  it('Updates the balances', async () => {
    const ccTransaction = generateCcTransaction(t)
    // Check balances before
    t.account0 = (await t.api.get(`/TEST/accounts/${t.account0.id}`, t.admin)).body.data
    assert.equal(t.account0.attributes.balance, 0)
    t.account2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data
    assert.equal(t.account2.attributes.balance, 0)
    const accountStatusBefore = await t.api.get(`/TEST/cc/account?acc_path=TEST0002`, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' }, 200)
    assert.deepEqual(accountStatusBefore.body, {
      balance: 0,
      entries: 0,
      gross_in: 0,
      gross_out: 0,
      partners: 0,
      pending: 0,
      trades: 0
    })
    const accountHistoryBefore = await t.api.get(`/TEST/cc/account/history?acc_path=TEST0002`, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' }, 200)
    assert.deepEqual(accountHistoryBefore.body, {
      data: {},
      meta: {
        end: '0000-01-01 00:00:00',
        max: 0,
        min: null,
        points: 0,
        start: '9999-01-01 00:00:00'
      }
    })
    const response = await t.api.post(
      "/TEST/cc/transaction/relay",
      ccTransaction,
      { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' },
      201)
    assert.equal(JSON.stringify(response.body.data, null, 2), JSON.stringify(ccTransaction.entries, null, 2))
    const expectedNetGain = (14 - 2 - 3 - 1) * 10000
    // Check balances after
    t.account0 = (await t.api.get(`/TEST/accounts/${t.account0.id}`, t.admin)).body.data
    assert.equal(t.account0.attributes.balance, -expectedNetGain)
    t.account2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data
    assert.equal(t.account2.attributes.balance, expectedNetGain)
    const accountStatusAfter = await t.api.get(`/TEST/cc/account?acc_path=TEST0002`, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' }, 200)
    assert.deepEqual(accountStatusAfter.body, {
      balance: 8,
      entries: 1,
      gross_in: 8,
      gross_out: 0,
      partners: 0,
      pending: 0,
      trades: 1
    })
    const accountHistoryAfter = await t.api.get(`/TEST/cc/account/history?acc_path=TEST0002`, { user: null, scopes: [], ccNode: 'trunk', lastHash: 'trunk' }, 200)
    const transDates = Object.keys(accountHistoryAfter.body.data)
    assert.equal(transDates.length, 1)
    assert.deepEqual(accountHistoryAfter.body, {
      data: {
        [transDates[0]]: 8
      },
      meta: {
        end: transDates[0],
        max: 8,
        min: 8,
        points: 0,
        start: transDates[0]
      }
    })

  })
})