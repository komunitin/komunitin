import { describe, it } from "node:test"
import assert from "node:assert"
import { setupServerTest } from "./setup"
import { waitFor } from "./utils"

describe("OnPayment credit limit", async () => {
  const t = setupServerTest()
  
  await it('admin enable on-payment credit limit', async () => {
    const response = await t.api.patch('/TEST/currency', {
      data: {
        attributes: {
          settings: {
            defaultOnPaymentCreditLimit: 1300
          }
        }
      }
    }, t.admin)
    assert.equal(response.body.data.attributes.settings.defaultOnPaymentCreditLimit, 1300)
    assert.equal(response.body.data.attributes.settings.defaultInitialCreditLimit, 1000)
  })

  await it('user increases credit limit after payment', async () => {
    await t.payment(t.account1.id, t.account2.id, 200, "Increase credit", "committed", t.user1)

    await waitFor(async () => {
      const a2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data

      return a2.attributes.balance === 200 &&
            a2.attributes.creditLimit === 1200
    }, "Credit limit updated after payment", 10000, 500)

    const a1 = (await t.api.get(`/TEST/accounts/${t.account1.id}`, t.user2)).body.data
    assert.equal(a1.attributes.balance, -200)
    assert.equal(a1.attributes.creditLimit, 1000)
  })

  await it ('user can indeed use credit limit', async () => {
    await t.payment(t.account2.id, t.account1.id, 1400, "Use credit", "committed", t.user2)

    await waitFor(async () => {
      const a1 = (await t.api.get(`/TEST/accounts/${t.account1.id}`, t.user2)).body.data

      return a1.attributes.balance === 1200 &&
            a1.attributes.creditLimit === 1300
    }, "Credit limit updated to max", 10000, 500)

    const a2 = (await t.api.get(`/TEST/accounts/${t.account2.id}`, t.user2)).body.data
    
    assert.equal(a2.attributes.balance, -1200)
    assert.equal(a2.attributes.creditLimit, 1200)

  })

})