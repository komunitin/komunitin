import { before, describe, it } from "node:test"
import assert from "node:assert"

import { setupServerTest } from './setup'
import { seedTransfers } from "./db"

describe('Statistics endpoints', async () => {
  const t = setupServerTest()
  const start = new Date(2024, 0, 1)
  const end = new Date(2024, 11, 31)
  before(async () => {
    // Add some transfers to the DB (without actually performing them in the ledger for speed)
    await seedTransfers("TEST", 1000, start, end)
  })

  it('volume in one month', async () => {
    const response = await t.api.get('/TEST/stats/volume?from=2024-06-01Z&to=2024-07-01Z', t.user1)
    console.log(response.body.data)
    assert.equal(response.body.data.attributes.values.length, 1)
    assert.equal(response.body.data.attributes.values[0], 4743000)
    assert.equal(new Date(response.body.data.attributes.from).toISOString(), new Date("2024-06-01Z").toISOString())
    assert.equal(new Date(response.body.data.attributes.to).toISOString(), new Date("2024-07-01Z").toISOString())
  })

  it('volume all time', async () => {
    const response = await t.api.get('/TEST/stats/volume', t.user1)
    console.log(response.body.data)
    assert.equal(response.body.data.attributes.values.length, 1)
    assert.equal(response.body.data.attributes.values[0], 48970300)
    assert.equal(response.body.data.attributes.from, undefined)
    assert.ok(new Date().getTime() - new Date(response.body.data.attributes.to).getTime() < 1000, "To date should be now")
  })

  it('volume by months across a year', async () => {
    const response = await t.api.get('/TEST/stats/volume?from=2024-01-01Z&to=2025-01-01Z&interval=P1M', t.user1)
    console.log(response.body.data)
    assert.equal(response.body.data.attributes.values.length, 12)
    assert.equal(response.body.data.attributes.values[5], 4743000)
    assert.equal(new Date(response.body.data.attributes.from).toISOString(), new Date("2024-01-01Z").toISOString())
    assert.equal(new Date(response.body.data.attributes.to).toISOString(), new Date("2025-01-01Z").toISOString())
    assert.equal(response.body.data.attributes.interval, "P1M")
  })

  it('volume all time by weeks', async () => {
    const response = await t.api.get('/TEST/stats/volume?interval=P1W', t.user1)
    console.log(response.body.data)
    // The number of weeks since 2024-01-01. This can fail in very specific cases, but should be good enough.
    const weeks = Math.ceil((new Date().getTime() - new Date(2024, 0, 1).getTime()) / (1000*60*60*24*7))
    assert.equal(response.body.data.attributes.values.length, weeks)
    assert.equal(response.body.data.attributes.values[0], 459900)
    assert.equal(response.body.data.attributes.values[1], 565200)
    assert.equal(response.body.data.attributes.values[weeks-1], 0)
    assert.equal(new Date(response.body.data.attributes.from).toISOString(), "2024-01-01T05:09:25.328Z")
    assert.ok(new Date().getTime() - new Date(response.body.data.attributes.to).getTime() < 1000, "To date should be now")
  })

  it('accounts single value', async () => {})
  it('accounts multiple values', async () => {})

})
