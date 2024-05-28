import {config} from "../../src/config"
import {http, HttpResponse} from "msw"
import { jwks } from "./auth.mock"
import { setupServer } from 'msw/node'

const handlers = [
  http.get(config.AUTH_JWKS_URL, () => {
    return HttpResponse.json(jwks())
  })
]

export const server = setupServer(...handlers)
