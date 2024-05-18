import {describe, it, before, after} from "node:test"
import assert from "node:assert"
import request from "supertest"
import { createApp } from "src/server/app"
import { App } from "supertest/types"
import {validate as isUuid} from "uuid"


describe('The Komunitin accounting API', async () => {
  let app: App
  before(async () => {
    app = await createApp()
  })
  it('POST /currencies', async () => {
    // Create a new currency
    const response = await request(app)
      .post('/currencies')
      .send({
        data: {
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
      })
      .set('Content-Type', 'application/vnd.api+json')

    assert.equal(response.status, 200, response.body.errors?.[0]?.detail ?? response.status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    assert(isUuid(response.body.data.id), "The currency id is not a valid UUID")
    assert.equal(response.body.data.type, 'currencies')
    assert.equal(response.body.data.attributes.code, 'TEST')
    assert.equal(response.body.data.attributes.name, 'Testy')
    assert.equal(response.body.data.attributes.rate.n, 1)
    assert.equal(response.body.data.attributes.rate.d, 10)
    assert.equal(response.body.data.attributes.defaultCreditLimit, 1000)
  })

  it('GET /currencies', async () => {
    const response = await request(app).get('/currencies')
    assert.equal(response.status, 200)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    assert(Array.isArray(response.body.data))
  })

})