import { describe, before, after, it } from "node:test"
import assert from "node:assert"
import { server } from "./net.mock"
import { clearDb } from "./db"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import { client } from "./net.client"
import { testAccount, testCurrency, testTransfer, userAuth } from "./api.data"
import { validate as isUuid } from "uuid"

describe('Payment requests', async () => {
  let app: ExpressExtended
  let api: ReturnType<typeof client>

  const admin = userAuth("1")
  const user1 = userAuth("2")
  const user2 = userAuth("3")

  let account0: any, account1: any, account2: any


  const createAccount = async (user: string) => {
    const response = await api.post('/TEST/accounts', testAccount(user), admin)
    return response.body.data
  }

  before(async () => {
    await clearDb()
    app = await createApp()
    api = client(app)
    server.listen({ onUnhandledRequest: "bypass" })

    // Create currency TEST
    await api.post('/currencies', testCurrency(), admin)
    // Create 3 accounts
    account0 = await createAccount(admin.user)
    account1 = await createAccount(user1.user)
    account2 = await createAccount(user2.user)
  })

  it('user get account settings', async () => {
    const response = await api.get(`/TEST/accounts/${account1.id}/settings`, user1)
    assert.equal(response.body.data.type, 'account-settings')
    assert(isUuid(response.body.data.id))
    assert.equal(response.body.data.attributes.acceptPaymentsAutomatically, false)
  })

  it('user set account settings', async () => {
    const response = await api.patch(`/TEST/accounts/${account1.id}/settings`, {
      data: {
        attributes: {
          acceptPaymentsAutomatically: true
        }
      }
    }, user1)
    assert.equal(response.body.data.type, 'account-settings')
    assert(isUuid(response.body.data.id))
    assert.equal(response.body.data.attributes.acceptPaymentsAutomatically, true)
  })

  it('unauthorized account settings', async () => {
    await api.get(`/TEST/accounts/${account1.id}/settings`, user2, 403)
    await api.patch(`/TEST/accounts/${account1.id}/settings`, 
      { data: { attributes: { acceptPaymentsAutomatically: false } } },
      user2, 403
    )
    await api.get(`/TEST/accounts/${account1.id}/settings`, undefined, 401)
    await api.patch(`/TEST/accounts/${account1.id}/settings`, 
      { data: { attributes: { acceptPaymentsAutomatically: false } } },
      undefined, 401
    )
  })

  it('immediate payment request', async () => {
    const response = await api.post('/TEST/transfers', testTransfer(account1.id, account2.id, 100, "Immediate request", "committed"), user2)
    assert.equal(response.body.data.type, 'transfers')
    assert.equal(response.body.data.attributes.state, "committed")
    // check balances
    const response1 = await api.get(`/TEST/accounts/${account1.id}`, admin)
    assert.equal(response1.body.data.attributes.balance, -100)
    const response2 = await api.get(`/TEST/accounts/${account2.id}`, admin)
    assert.equal(response2.body.data.attributes.balance, 100)
  })

  it ('pending payment request', async() => {
    const response = await api.post('/TEST/transfers', testTransfer(account2.id, account1.id, 100, "Pending request", "committed"), user1)
    assert.equal(response.body.data.attributes.state, "pending")
    // check balances not changed
    const response1 = await api.get(`/TEST/accounts/${account1.id}`, admin)
    assert.equal(response1.body.data.attributes.balance, -100)
    const response2 = await api.get(`/TEST/accounts/${account2.id}`, admin)
    assert.equal(response2.body.data.attributes.balance, 100)
    // approve transfer by payer
    const response3 = await api.patch(`/TEST/transfers/${response.body.data.id}`, { data: { attributes: { state: "committed" } } }, user2)
    assert.equal(response3.body.data.attributes.state, "committed")
    // check balances
    const response4 = await api.get(`/TEST/accounts/${account1.id}`, admin)
    assert.equal(response4.body.data.attributes.balance, 0)
    const response5 = await api.get(`/TEST/accounts/${account2.id}`, admin)
    assert.equal(response5.body.data.attributes.balance, 0)
  })

  after(async () => {
    server.close()
    await closeApp(app)
  })
})
