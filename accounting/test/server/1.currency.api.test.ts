import {describe, it} from "node:test"
import assert from "node:assert"
import {validate as isUuid} from "uuid"
import { Scope } from "src/server/auth"
import { setupServerTest } from "./setup"

describe('Currencies endpoints', async () => {
  const t = setupServerTest(false)

  const admin1 = {user: "1", scopes: [Scope.Accounting]}
  const admin2 = {user: "2", scopes: [Scope.Accounting]}

  const currencyPostBody = (attributes: Record<string, any>, user: string) => ({
    data: {
      type: "currencies",
      attributes: {
        code: "TES1",
        name: "Testy",
        namePlural: "Testies",
        symbol: "T$",
        decimals: 2,
        scale: 4,
        rate: {n: 1, d: 10},
        ...attributes,
        settings: {
          defaultInitialCreditLimit: 1000,
          ...attributes.settings
        },
      },
      relationships: {
        admins: {
          data: [{ type: "users", id: user }]
        }
      }
    },
    included: [{
      type: "users",
      id: user
    }]
  })
  
  await it('create currency', async () => {
    // User 1 creates currency TES1
    const currency = currencyPostBody({code:"TES1"}, "1")
    const response = await t.api.post('/currencies', currency, admin1)
    assert(isUuid(response.body.data.id), "The currency id is not a valid UUID")
    assert.equal(response.body.data.type, 'currencies')
    assert.equal(response.body.data.attributes.code, 'TES1')
    assert.equal(response.body.data.attributes.name, 'Testy')
    assert.equal(response.body.data.attributes.rate.n, 1)
    assert.equal(response.body.data.attributes.rate.d, 10)
    assert.equal(response.body.data.attributes.settings.defaultInitialCreditLimit, 1000)    
  })

  // Helper doing an authenticated post to /currencies, expecting a 400 error.
  const badPost = async (attributes?: any) => {
    const currency = currencyPostBody(attributes, "400")
    const user400 = {user: "400", scopes: [Scope.Accounting]}
    const response = await t.api.post('/currencies', currency, user400, 400)
    assert.equal(response.body.errors[0].status, 400) 
  }

  await it('create currency with maxBalance', async () => {
    // User 2 creates currency TES2 with maximum balance defined.
    const currency = currencyPostBody({code:"TES2", settings: { defaultInitialMaximumBalance: 5000, defaultInitialCreditLimit: undefined }}, "2")
    const response = await t.api.post('/currencies', currency, admin2)

    assert.equal(response.body.data.attributes.settings.defaultInitialMaximumBalance, 5000)
    assert.equal(response.body.data.attributes.settings.defaultInitialCreditLimit, 0)
  })

  it('repeated code', async () => badPost({code: "TES1"}))
  it('incorrect code', async () => badPost({code: "EUR", rate: undefined}))
  it('missing rate', async () => badPost({code: "ERRO", rate: undefined}))
  it('incorrect div by zero rate', async () => badPost({code: "ERRO", rate: {n: 1, d: 0}}))
  it('incorrect zero rate', async () => badPost({code: "ERRO", rate: {n: 0, d: 1}}))
  it('incorrect negative rate', async () => badPost({code: "ERRO", rate: {n: -1, d: 1}}))
  it('incorrect limit', async () => badPost({code: "ERRO", settings: {defaultInitialCreditLimit: -1}}))
  
  // Only logged in users with komunitin_accounting scope can create currencies.
  it('unauthorized create', async () => {
    await t.api.post('/currencies', currencyPostBody({code: "ERRO"}, "400"), undefined, 401)
  })
  it('missing scope create', async () => {
    await t.api.post('/currencies', currencyPostBody({code: "ERRO"}, "400"), {user: "400", scopes: []}, 403)
  })

  // public endpoint
  it('list currencies', async () => {
    const response = await t.api.get('/currencies')
    assert(Array.isArray(response.body.data))
    assert.equal(response.body.data.length,2)
    assert.equal(response.body.data[0].attributes.code, 'TES1')
    assert.equal(response.body.data[1].attributes.code, 'TES2')
  })
  
  // public endpoint
  it('get currency', async () => {
    const response = await t.api.get('/TES1/currency')
    assert.equal(response.body.data.attributes.code, 'TES1')
  })
  
  it('not found currency', async () => {
    await t.api.get('/ERRO/currency', undefined, 404)
  })

  await it('can update currency', async () => {
    const response = await t.api.patch('/TES2/currency', {data: {
      attributes: {
        name: "Testy2",
        namePlural: "Testies2",
        settings: {
          defaultInitialCreditLimit: 1000
        }
      }
    }}, admin2)
    assert.equal(response.body.data.attributes.name, 'Testy2')
    assert.equal(response.body.data.attributes.namePlural, 'Testies2')
    assert.equal(response.body.data.attributes.settings.defaultInitialCreditLimit, 1000)
  })
  it('currency code cant be updated', async () => {
    await t.api.patch('/TES2/currency', {data: { attributes: { code: "ERRO" } }}, admin2, 400)
  })
  it('curency id cant be updated', async () => {
    await t.api.patch('/TES2/currency', {data: { id: "change-id" }}, admin2, 400)
  })
  it('forbidden update', async () => {
    await t.api.patch('/TES2/currency', {data: { attributes: { name: "Error" } }}, admin1, 403)
  })
  it('unauthenticated update', async () => {
    await t.api.patch('/TES2/currency', {data: { attributes: { name: "Error" } }}, undefined, 401)
  })

})
