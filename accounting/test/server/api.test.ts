import {describe, it, before, after} from "node:test"
import assert from "node:assert"
import request, { Response } from "supertest"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import {validate as isUuid} from "uuid"
import { Scope } from "src/server/auth"
import { token } from "./auth.mock"
import { server } from "./net.mock"

describe('The Komunitin accounting API', async () => {
  let app: ExpressExtended
  before(async () => {
    app = await createApp()
    server.listen({
      onUnhandledRequest: "bypass"
    })
  })
  after(async () => {
    server.close()
    await closeApp(app)
  })
  const completeRequest = async (req: any, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
    if (auth) {
      const access = await token(auth.user, auth.scopes)
      req.set('Authorization', `Bearer ${access}`)
    }
    const response = (await req) as Response
    assert.equal(response.status, status, response.body.errors?.[0]?.detail ?? response.status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    return response
  }
  const post = async (path: string, data: any, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
    return await completeRequest(
      request(app) 
        .post(path)
        .send(data)
        .set('Content-Type', 'application/vnd.api+json'), 
      auth, status)
  }

  const patch = async (path: string, data: any, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
    return await completeRequest(
      request(app)
        .patch(path)
        .send(data)
        .set('Content-Type', 'application/vnd.api+json'), 
      auth, status)
  }

  const get = async (path: string, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
    return await completeRequest(
      request(app)
        .get(path),
      auth, status)
  }
  

  const testCurrency = {
    type: "currencies",
    attributes: {
      code: "TES1",
      name: "Testy",
      namePlural: "Testies",
      symbol: "T$",
      decimals: 2,
      scale: 4,
      rate: {n: 1, d: 10},
      defaultCreditLimit: 1000
    }
  }
  await it('POST /currencies', async () => {
    // User 1 creates currency TES1
    const response = await post('/currencies', {data: testCurrency}, {user: "1", scopes: [Scope.Accounting]})
    assert(isUuid(response.body.data.id), "The currency id is not a valid UUID")
    assert.equal(response.body.data.type, 'currencies')
    assert.equal(response.body.data.attributes.code, 'TES1')
    assert.equal(response.body.data.attributes.name, 'Testy')
    assert.equal(response.body.data.attributes.rate.n, 1)
    assert.equal(response.body.data.attributes.rate.d, 10)
    assert.equal(response.body.data.attributes.defaultCreditLimit, 1000)
  })

  const badPost = async (attributes?: any) => {
    const response = await post('/currencies', {data: {
      ...testCurrency,
      attributes: {
        ...testCurrency.attributes,
        ...attributes
      }
    }}, {user: "1", scopes: [Scope.Accounting]}, 400)
    assert.equal(response.body.errors[0].status, 400) 
  }

  await it('POST /currencies maxBalance', async () => {
    // User 2 creates currency TES2 with maximum balance defined.
    const response = await post('/currencies', {data: {
      ...testCurrency,
      attributes: {
        ...testCurrency.attributes,
        code: "TES2",
        defaultCreditLimit: undefined,
        defaultMaximumBalance: 5000
      }
    }}, {user: "2", scopes: [Scope.Accounting]})
    assert.equal(response.body.data.attributes.defaultMaximumBalance, 5000)
    assert.equal(response.body.data.attributes.defaultCreditLimit, 0)
  })

  it('POST /currencies repeated code', async () => badPost({code: "TES1"}))
  it('POST /currencies incorrect code', async () => badPost({code: "EUR", rate: undefined}))
  it('POST /currencies missing rate', async () => badPost({code: "ERRO", rate: undefined}))
  it('POST /currencies incorrect rate', async () => badPost({code: "ERRO", rate: {n: 1, d: 0}}))
  it('POST /currencies incorrect rate', async () => badPost({code: "ERRO", rate: {n: -1, d: 1}}))
  it('POST /currencies incorrect limit', async () => badPost({code: "ERRO", defaultCreditLimit: -1}))
  
  // Only logged in users with komunitin_accounting scope can create currencies.
  it.only('POST /currencies unauthenticated', async () => {
    await post('/currencies', {data: {...testCurrency, code: "ERRO"}}, undefined, 401)
  })
  it('POST /currencies unauthenticated', async () => {
    // failing
    await post('/currencies', {data: {...testCurrency, code: "ERRO"}}, {user: "2", scopes: []}, 403)
  })

  it('GET /currencies', async () => {
    // Unauthenticated
    const response = await get('/currencies')
    assert(Array.isArray(response.body.data))
    assert.equal(response.body.data.length,2)
    assert.equal(response.body.data[0].attributes.code, 'TES1')
    assert.equal(response.body.data[1].attributes.code, 'TES2')
  })

  it('GET /TES1/currency', async () => {
    const response = await get('/TES1/currency')
    assert.equal(response.body.data.attributes.code, 'TES1')
  })
  it('GET /ERRO/currency', async () => {
    await get('/ERRO/currency', undefined, 404)
  })
  await it('PATCH /TES2/currency', async () => {
    const response = await patch('/TES2/currency', {data: {
      attributes: {
        name: "Testy2",
        namePlural: "Testies2",
        defaultCreditLimit: 1000
      }
    }}, {user: "2", scopes: [Scope.Accounting]})
    assert.equal(response.body.data.attributes.name, 'Testy2')
    assert.equal(response.body.data.attributes.namePlural, 'Testies2')
    assert.equal(response.body.data.attributes.defaultCreditLimit, 1000)
  })
  it('PATCH /TES2/currency error code', async () => {
    await patch('/TES2/currency', {data: { attributes: { code: "ERRO" } }}, {user: "2", scopes: [Scope.Accounting]}, 400)
  })
  it('PATCH /TES1/currency error id', async () => {
    await patch('/TES2/currency', {data: { id: "change-id" }}, {user: "2", scopes: [Scope.Accounting]}, 400)
  })
  // Only owner can update currencies
  it('PATCH /TES2/currency error code', async () => {
    await patch('/TES2/currency', {data: { attributes: { name: "Error" } }}, {user: "1", scopes: [Scope.Accounting]}, 403)
  })
  it('PATCH /TES2/currency error code', async () => {
    await patch('/TES2/currency', {data: { attributes: { name: "Error" } }}, undefined, 401)
  })

})