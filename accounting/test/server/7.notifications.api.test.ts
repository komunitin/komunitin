import { describe, it } from "node:test"
import { setupServerTest } from './setup'
import assert from "node:assert"
import { clearEvents, getEvents } from "./net.mock"

describe("Send events to notifications service", async () => {
  const t = setupServerTest()

  let transfer: any
  await it('sends pending event', async () => {
    transfer = await t.payment(t.account1.id, t.account2.id, 100, "Test notifications", "committed", t.user2, 200)
    assert.equal(transfer.attributes.state, "pending")
    const events = getEvents()
    assert.equal(events.length, 1)
    const atts = events[0].attributes
    assert.equal(atts.name, "TransferPending")
    assert.equal(atts.data.transfer, transfer.id)
    assert.equal(atts.data.payer, t.account1.id)
    assert.equal(atts.data.payee, t.account2.id)
  })

  await it('sends committed event', async () => {
    transfer = (await t.api.patch(`/TEST/transfers/${transfer.id}`, {
      data: {
        attributes: {
          state: "committed"
        }
      }
    }, t.user1)).body.data
    assert.equal(transfer.attributes.state, "committed")
    const events = getEvents()
    assert.equal(events.length, 2)
    const atts = events[1].attributes
    assert.equal(atts.name, "TransferCommitted")
    assert.equal(atts.data.transfer, transfer.id)
    assert.equal(atts.data.payer, t.account1.id)
    assert.equal(atts.data.payee, t.account2.id)
  })

  await it('sends rejected event', async () => {
    clearEvents()
    transfer = await t.payment(t.account1.id, t.account2.id, 100, "Test notifications", "committed", t.user2, 200)
    transfer = (await t.api.patch(`/TEST/transfers/${transfer.id}`, {
      data: {
        attributes: {
          state: "rejected"
        }
      }
    }, t.user1)).body.data
    assert.equal(transfer.attributes.state, "rejected")
    const events = getEvents()
    assert.equal(events.length, 2)
    assert.equal(events[0].attributes.name, "TransferPending")
    assert.equal(events[1].attributes.name, "TransferRejected")
  })
})