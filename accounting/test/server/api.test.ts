import {describe, it, before, after} from "node:test"
import assert from "node:assert"
import request from "supertest"
import { ExpressExtended, closeApp, createApp } from "src/server/app"
import {validate as isUuid} from "uuid"

describe('The Komunitin accounting API', async () => {
  let app: ExpressExtended
  before(async () => {
    app = await createApp()
  })
  after(async () => {
    await closeApp(app)
  })
  const post = async (path: string, data: any, status: number = 200) => {
    const response = await request(app)
      .post(path)
      .send(data)
      .set('Content-Type', 'application/vnd.api+json')
    assert.equal(response.status, status, response.body.errors?.[0]?.detail ?? response.status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    return response
  }

  const patch = async (path: string, data: any, status: number = 200) => {
    const response = await request(app)
      .patch(path)
      .send(data)
      .set('Content-Type', 'application/vnd.api+json')
    assert.equal(response.status, status, response.body.errors?.[0]?.detail ?? response.status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    return response
  }

  const get = async (path: string, status: number = 200) => {
    const response = await request(app).get(path)
    assert.equal(response.status, status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    return response
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
    // Create a new currency
    const response = await post('/currencies', {data: testCurrency})
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
    }}, 400)
    assert.equal(response.body.errors[0].status, 400) 
  }

  await it('POST /currencies maxBalance', async () => {
    const response = await post('/currencies', {data: {
      ...testCurrency,
      attributes: {
        ...testCurrency.attributes,
        code: "TES2",
        defaultCreditLimit: undefined,
        defaultMaximumBalance: 5000
      }
    }})
    assert.equal(response.body.data.attributes.defaultMaximumBalance, 5000)
    assert.equal(response.body.data.attributes.defaultCreditLimit, 0)
  })

  it('POST /currencies repeated code', async () => badPost({code: "TES1"}))
  it('POST /currencies incorrect code', async () => badPost({code: "EUR", rate: undefined}))
  it('POST /currencies missing rate', async () => badPost({code: "ERRO", rate: undefined}))
  it('POST /currencies incorrect rate', async () => badPost({code: "ERRO", rate: {n: 1, d: 0}}))
  it('POST /currencies incorrect rate', async () => badPost({code: "ERRO", rate: {n: -1, d: 1}}))
  it('POST /currencies incorrect limit', async () => badPost({code: "ERRO", defaultCreditLimit: -1}))

  it('GET /currencies', async () => {
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
    await get('/ERRO/currency', 404)
  })
  await it('PATCH /TES2/currency', async () => {
    const response = await patch('/TES2/currency', {data: {
      attributes: {
        name: "Testy2",
        namePlural: "Testies2",
        defaultCreditLimit: 1000
      }
    }})
    assert.equal(response.body.data.attributes.name, 'Testy2')
    assert.equal(response.body.data.attributes.namePlural, 'Testies2')
    assert.equal(response.body.data.attributes.defaultCreditLimit, 1000)
  })
  it('PATCH /TES1/currency error code', async () => {
    await patch('/TES2/currency', {data: { attributes: { code: "ERRO" } }}, 400)
  })
  it('PATCH /TES1/currency error id', async () => {
    await patch('/TES2/currency', {data: { id: "change-id" }}, 400)
  })

})