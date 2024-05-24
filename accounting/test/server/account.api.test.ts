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

  before(async () => {
    await clearDb()
    app = await createApp()
    api = client(app)
    server.listen({ onUnhandledRequest: "bypass" })
    // Create currency TEST
    await api.post('/currencies', { data: testCurrency }, admin)
  })
  
  after(async () => {
    server.close()
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
    assert.equal(response.body.data.length, 2)
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
  })

  it('unauthorized get account', async() => {
    await api.get(`/TEST/accounts/${account0.id}`, undefined, 401)
  })
  it('forbidden get account', async() => {
    await api.get(`/TEST/accounts/${account0.id}`, user3, 403)
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
    await api.delete(`/TEST/accounts/${account1.id}`, user2, 204)
  })




})