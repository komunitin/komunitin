import { describe, before, after, it } from "node:test"
import assert from "node:assert"
import { client } from "./net.client"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import { clearDb } from "./db"
import { server } from "./net.mock"
import { Scope } from "src/server/auth"
import { validate as isUuid } from "uuid"


describe('Transfer endpoints', async () => {
  let app: ExpressExtended
  let api: ReturnType<typeof client>

  const testCurrency = {
    type: "currencies",
    attributes: {
      code: "TEST",
      name: "Testy",
      namePlural: "Testies",
      symbol: "T$",
      decimals: 2,
      scale: 4,
      rate: {n: 1, d: 10},
      defaultCreditLimit: 1000
    }
  }
  const admin = { user: "1", scopes: [Scope.Accounting] }
  const user2 = { user: "2", scopes: [Scope.Accounting] }
  const user3 = { user: "3", scopes: [Scope.Accounting] }

  const createAccount = async (user: string) => {
    const response = await api.post('/TEST/accounts', {
      data: {
        relationships: {
          users: { data: [{ type: "users", id: user }] }
        }
      },
      included: [{ type: "users", id: user }]
    }, admin)
    return response.body.data
  }
  const payment = async (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus = 200) => {
    const response = await api.post('/TEST/transfers', {
      data: {
        attributes: {
          amount,
          meta,
          state
        },
        relationships: {
          payer: { data: { type: "accounts", id: payer }},
          payee: { data: { type: "accounts", id: payee }}
        }
      }
    }, auth, httpStatus)
    return response.body.data
  }

  let account0: any, account1: any, account2: any

  before(async () => {
    await clearDb()
    app = await createApp()
    api = client(app)
    server.listen({ onUnhandledRequest: "bypass" })
    // Create currency TEST
    await api.post('/currencies', { data: testCurrency }, admin)
    // Create 3 accounts
    account0 = await createAccount(admin.user)
    account1 = await createAccount(user2.user)
    account2 = await createAccount(user3.user)
  })

  await it('user performs payment', async () => {
    const transfer = await payment(account1.id, account2.id, 100, "User transfer", "committed", user2)
    assert.equal(transfer.attributes.amount, 100)
    assert.equal(transfer.attributes.meta, "User transfer")
    assert.equal(transfer.attributes.state, "committed")
    assert.equal(transfer.relationships.payer.data.id, account1.id)
    assert.equal(transfer.relationships.payee.data.id, account2.id)
    assert(isUuid(transfer.id))
    
    // Check balances
    account1 = (await api.get(`/TEST/accounts/${account1.id}`, user2)).body.data
    assert.equal(account1.attributes.balance, -100)
    account2 = (await api.get(`/TEST/accounts/${account2.id}`, user3)).body.data
    assert.equal(account2.attributes.balance, 100)
  })

  await it('admin performs payment between users', async () => {
    const transfer = await payment(account1.id, account2.id, 40, "Admin transfer", "committed", admin)
    assert.equal(transfer.attributes.amount, 40)
    
    // Check balances
    account1 = (await api.get(`/TEST/accounts/${account1.id}`, user2)).body.data
    assert.equal(account1.attributes.balance, -140)
    account2 = (await api.get(`/TEST/accounts/${account2.id}`, user3)).body.data
    assert.equal(account2.attributes.balance, 140)
  })

  await it("two-step payment", async () => {
    const transfer = await payment(account1.id, account2.id, 30, "Two-step transfer", "new", user2)
    assert.equal(transfer.attributes.amount, 30)
    assert.equal(transfer.attributes.state, "new")

    // balance don't change yet
    account1 = (await api.get(`/TEST/accounts/${account1.id}`, user2)).body.data
    assert.equal(account1.attributes.balance, -140)
    account2 = (await api.get(`/TEST/accounts/${account2.id}`, user3)).body.data
    assert.equal(account2.attributes.balance, 140)

    const response2 = await api.patch(`/TEST/transfers/${transfer.id}`, {
      data: {
        attributes: {
          state: "committed"
        }
      }
    }, user2)
    const transfer2 = response2.body.data
    assert.equal(transfer2.attributes.state, "committed")
    assert.equal(transfer2.attributes.meta, "Two-step transfer")
    assert.equal(transfer2.attributes.amount, 30)

    //balance changed
    account1 = (await api.get(`/TEST/accounts/${account1.id}`, user2)).body.data
    assert.equal(account1.attributes.balance, -170)
    account2 = (await api.get(`/TEST/accounts/${account2.id}`, user3)).body.data
    assert.equal(account2.attributes.balance, 170)
  })

  await it('unauthorized payment', async () => {
    await payment(account1.id, account2.id, 10, "Unauthorized transfer", "committed", undefined, 401)
  })

  await it('forbidden payment', async () => {
    // user not involved
    await payment(account0.id, account1.id, 10, "Unauthorized transfer", "committed", user3, 403)
    // user is the payee
    await payment(account1.id, account2.id, 10, "Unauthorized transfer", "committed", user3, 403)
  })

  await it('invalid payments', async () => {
    // negative amount
    await payment(account1.id, account2.id, -10, "Invalid transfer", "committed", user2, 400)
    // zero amount
    await payment(account1.id, account2.id, 0, "Invalid transfer", "committed", user2, 400)
    // payer and payee are the same
    await payment(account1.id, account1.id, 10, "Invalid transfer", "committed", user2, 400)
    // payer not found
    await payment("12345678-1234-1234-1234-123456789012", account1.id, 10, "Invalid transfer", "committed", user2, 404)
    // payee not found
    await payment(account1.id, "12345678-1234-1234-1234-123456789012", 10, "Invalid transfer", "committed", user2, 404)
    // invalid state
    await payment(account1.id, account2.id, 10, "Invalid transfer", "invalid", user2, 400)
    // floating point amount
    await payment(account1.id, account2.id, 10.5, "Invalid transfer", "committed", user2, 400)
  })

  await it('insufficient funds', async () => {
    await payment(account1.id, account2.id, 900, "Insufficient funds", "committed", user2, 400)
  })

  await it('update credit limit', async () => {
    const response = await api.patch(`/TEST/accounts/${account1.id}`, {
      data: { attributes: { creditLimit: 2000 } }
    }, admin)
    assert.equal(response.body.data.attributes.creditLimit, 2000)
    const transfer = await payment(account1.id, account2.id, 900, "Sufficient funds", "committed", user2)
    assert.equal(transfer.attributes.amount, 900)
    assert.equal(transfer.attributes.state, "committed")
    // Check balances
    account1 = (await api.get(`/TEST/accounts/${account1.id}`, user2)).body.data
    assert.equal(account1.attributes.balance, -1070)
    account2 = (await api.get(`/TEST/accounts/${account2.id}`, user3)).body.data
    assert.equal(account2.attributes.balance, 1070)
  })

  after(async () => {
    server.close()
    await closeApp(app)
  })

})