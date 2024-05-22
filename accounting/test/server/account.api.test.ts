import { describe, before, after, it } from "node:test"
import assert from "node:assert"
import { validate as isUuid } from "uuid"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import { client } from "./net.client"
import { server } from "./net.mock"
import { Scope } from "src/server/auth"
import { clearDb } from "./db"

describe('Accounts endpoints', async () => {
  let app: ExpressExtended
  let api: ReturnType<typeof client>

  const testCurrency = {
    type: "currencies",
    attributes: {
      code: "ACC1",
      name: "Testy",
      namePlural: "Testies",
      symbol: "T$",
      decimals: 2,
      scale: 4,
      rate: {n: 1, d: 10},
      defaultCreditLimit: 1000
    }
  }

  const admin = { user: "10", scopes: [Scope.Accounting] }

  before(async () => {
    await clearDb()
    app = await createApp()
    api = client(app)
    server.listen({ onUnhandledRequest: "bypass" })
    // Create currency ACC1
    await api.post('/currencies', { data: testCurrency }, admin)
  })
  
  after(async () => {
    server.close()
    await closeApp(app)
  })

  it.skip('Admin creates own account', async () => {
    const response = await api.post('/accounts', {
      data: {}
    } , admin)
    assert(isUuid(response.body.data.id), "The account id is not a valid UUID")
    assert.equal(response.body.data.type, 'accounts')
    assert.equal(response.body.data.attributes.code, 'ACC10000')
  })

  it.skip('Admin creates user account using sidepost', async () => {
    const response = await api.post('/accounts', {
      data: {
        relationships: {
          users: {
            data: [{ type: "users", id: "11" }]
          },
        }
      },
      included: [{
        type: "users",
        id: "11",
      }]
    }, admin)
  })

})