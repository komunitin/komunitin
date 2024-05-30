import { describe, before, after, it } from "node:test"
import assert from "node:assert"
import { server } from "./net.mock"
import { clearDb } from "./db"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import { client } from "./net.client"
import { testAccount, testCurrency, userAuth } from "./api.data"
import { validate as isUuid } from "uuid"

describe('Payment requests', async () => {
  let app: ExpressExtended
  let api: ReturnType<typeof client>

  const admin = userAuth("1")
  const user2 = userAuth("2")
  const user3 = userAuth("3")

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
    account1 = await createAccount(user2.user)
    account2 = await createAccount(user3.user)
  })

  it('user get account settings', async () => {
    const response = await api.get(`/TEST/accounts/${account1.id}/settings`, user2)
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
    }, user2)
    assert.equal(response.body.data.type, 'account-settings')
    assert(isUuid(response.body.data.id))
    assert.equal(response.body.data.attributes.acceptPaymentsAutomatically, true)
  })

  it('unauthorized account settings', async () => {
    await api.get(`/TEST/accounts/${account1.id}/settings`, user3, 403)
    await api.patch(`/TEST/accounts/${account1.id}/settings`, 
      { data: { attributes: { acceptPaymentsAutomatically: false } } },
      user3, 403
    )
    await api.get(`/TEST/accounts/${account1.id}/settings`, undefined, 401)
    await api.patch(`/TEST/accounts/${account1.id}/settings`, 
      { data: { attributes: { acceptPaymentsAutomatically: false } } },
      undefined, 401
    )
  })
  after(async () => {
    server.close()
    await closeApp(app)
  })
})
