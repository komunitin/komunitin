import { describe, before, after, it } from "node:test"
import assert from "node:assert"
import { validate as isUuid } from "uuid"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import { TestApiClient, client } from "./net.client"
import { startServer, stopServer } from "./net.mock"
import { Scope } from "src/server/auth"
import { clearDb } from "./db"
import { testCurrency } from "./api.data"
import { config } from "src/config"
import { response } from "express"

describe('Accounts endpoints', async () => {
  let app: ExpressExtended
  let api: TestApiClient

  const admin = { user: "1", scopes: [Scope.Accounting] }
  const user2 = { user: "2", scopes: [Scope.Accounting] }
  const user3 = { user: "3", scopes: [Scope.Accounting] }

  before(async () => {
    await clearDb()
    app = await createApp()
    api = client(app)
    startServer(app)
    // Create currency TEST
    await api.post('/currencies', testCurrency(), admin)
  })
  
  after(async () => {
    stopServer()
    await closeApp(app)
  })

  await it('admin creates own account', async () => {
    const response = await api.post('/TEST/accounts', {
      data: {}
    } , admin)
    assert(isUuid(response.body.data.id), "The account id is not a valid UUID")
    assert.equal(response.body.data.type, 'accounts')
    assert.equal(response.body.data.attributes.code, 'TEST0000')
    assert.equal(response.body.data.attributes.balance, 0)
    assert.equal(response.body.data.attributes.creditLimit, 1000)
    assert.equal(response.body.data.attributes.maximumBalance, undefined)
  })

  await it('admin creates user account', async () => {
    const response = await api.post('/TEST/accounts', {
      data: {
        relationships: { users: { data: [{ type: "users", id: "2" }] }}
      },
      included: [{ type: "users", id: "2"}]
    }, admin)
    assert(isUuid(response.body.data.id), "The account id is not a valid UUID")
    assert.equal(response.body.data.type, 'accounts')
    assert.equal(response.body.data.attributes.code, 'TEST0001')
  })

  await it('admin creates account with attributes', async () => {
    const response = await api.post('/TEST/accounts', {
      data: {
        attributes: { 
          code: 'TEST2000', 
          creditLimit: 2000,
          maximumBalance: 20000
        }
      }
    }, admin)

    assert(isUuid(response.body.data.id), "The account id is not a valid UUID")
    assert.equal(response.body.data.type, 'accounts')
    assert.equal(response.body.data.attributes.code, 'TEST2000')
    assert.equal(response.body.data.attributes.creditLimit, 2000)
    assert.equal(response.body.data.attributes.maximumBalance, 20000)
  })

  it('unauthorized creation', async () => {
    await api.post('/TEST/accounts', { 
      data: { 
        relationships: {users: { data: [{ type: "users", id: "3" }] }} 
      },
      included: [{type: "users",id: "3"}]
     }, undefined, 401)
  })

  it('forbidden creation', async () => {
    await api.post('/TEST/accounts', { data: {} }, user3, 403)
  })

  let account0: any;
  let account1: any;
  it('user lists accounts', async () => {
    const response = await api.get('/TEST/accounts', user2)
    assert.equal(response.body.data.length, 3)
    account0 = response.body.data[0]
    account1 = response.body.data[1]
    assert.equal(account0.attributes.code, 'TEST0000')
    assert.equal(account1.attributes.code, 'TEST0001')
  })

  it('unauthorized list accounts', async() => {
    await api.get('/TEST/accounts', undefined, 401)
  })
  it('forbidden list accounts', async() => {
    await api.get('/TEST/accounts', user3, 403)
  })

  it('allowed anonymous list accounts by id', async () => {
    const response = await api.get('/TEST/accounts?filter[id]=' + account0.id, undefined)
    assert.equal(response.body.data.length, 1)
    assert.equal(response.body.data[0].links.self, `${config.API_BASE_URL}/TEST/accounts/${account0.id}`)
  })

  await it('user get account', async () => {
    const response1 = await api.get('/TEST/accounts?filter[code]=TEST0000', user2)
    assert.equal(response1.body.data.length, 1)
    assert.equal(response1.body.data[0].attributes.code, 'TEST0000')
    const response2 = await api.get(`/TEST/accounts/${account0.id}`, user2)
    assert.equal(response2.body.data.attributes.code, 'TEST0000')
  })

  it('including currency', async () => {
    const response = await api.get(`/TEST/accounts/${account0.id}?include=currency`, user2)
    assert.equal(response.body.data.attributes.code, 'TEST0000')
    assert.equal(response.body.included[0].type, 'currencies')
    assert.equal(response.body.included[0].attributes.code, 'TEST')
    assert.equal(response.body.included[0].attributes.symbol, 'T$')
    assert.equal(response.body.data.links.self, `${config.API_BASE_URL}/TEST/accounts/${account0.id}`)
  })

  it('including settings', async() => {
    const response = await api.get(`/TEST/accounts/${account0.id}?include=settings`, user2)
    assert.equal(response.body.data.attributes.code, 'TEST0000')
    assert.equal(response.body.included[0].type, 'account-settings')
    assert.equal(response.body.included[0].attributes.acceptPaymentsAutomatically, false)
  })

  // Account endpoints are public.
  it('unauthorized get account', async() => {
    await api.get(`/TEST/accounts/${account0.id}`, undefined, 200)
  })
  it('external user get account', async() => {
    await api.get(`/TEST/accounts/${account0.id}`, user3, 200)
  })

  it('admin updates credit limit', async () => {
    const response = await api.patch(`/TEST/accounts/${account0.id}`, {
      data: {
        attributes: { creditLimit: 2000 }
      }
    }, admin)
    assert.equal(response.body.data.attributes.code, 'TEST0000')
    assert.equal(response.body.data.attributes.creditLimit, 2000)
  })
  it('admin updates code', async () => {
    const response = await api.patch(`/TEST/accounts/${account0.id}`, {
      data: {
        attributes: { code: 'TEST1000'}
      }
    }, admin)
    assert.equal(response.body.data.attributes.code, 'TEST1000')
  })
  it ('illegal code', async () => {
    await api.patch(`/TEST/accounts/${account0.id}`, {
      data: { attributes: { code: 'ILLE0003'} }
    }, admin, 400)
  })
  it ('repeated code', async () => {
    await api.patch(`/TEST/accounts/${account0.id}`, {
      data: { attributes: { code: 'TEST0001'} }
    }, admin, 400)
  })
  it.todo('admin updates maximum balance', async () => {
    const response = await api.patch(`/TEST/accounts/${account0.id}`, {
      data: {attributes: { maximumBalance: 10000 }}
    }, admin)
    assert.equal(response.body.data.attributes.maximumBalance, 10000)
  })
  it('admin cannot update balance', async () => {
    await api.patch(`/TEST/accounts/${account0.id}`, {
      data: {attributes: { balance: 100 }}
    }, admin, 400)
  })
  it('user cannot update own limits', async() => {
    await api.patch(`/TEST/accounts/${account1.id}`, {
      data: {attributes: { creditLimit: 100000 }}
    }, user2, 403)
  })
  it('user cannot delete other accounts', async () => {
    await api.delete(`/TEST/accounts/${account0.id}`, user2, 403)
  })
  it('user can delete own account', async () => {
    await api.delete(`/TEST/accounts/${account1.id}`, user2)
  })

})