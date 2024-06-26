import {config} from "../../src/config"
import {http, HttpResponse} from "msw"
import { jwks } from "./auth.mock"
import { setupServer } from 'msw/node'
import { logger } from "src/utils/logger"

const events: any[] = []

export const getEvents = () => events
export const clearEvents = () => events.splice(0, events.length)

const handlers = [
  
  // Mock the JWKS endpoint from Auth Server
  http.get(config.AUTH_JWKS_URL, () => {
    return HttpResponse.json(jwks())
  }),

  // Mock notifications service events endpoint.
  http.post(`${config.NOTIFICATIONS_API_URL}/events`, async (info) => {
    const doc = (await new Response(info.request.body).json()) as any
    const event = doc.data
    event.id = (events.length + 1).toString()
    events.push(event)
    logger.info(event, "Event sent to notifications service")
    return HttpResponse.json(doc, { status: 201 })
  })
]



export const server = setupServer(...handlers)
