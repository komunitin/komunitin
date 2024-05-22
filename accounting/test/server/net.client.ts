import { Scope } from "src/server/auth"
import { Express } from "express"
import request, { Response, Request } from "supertest"
import assert from "node:assert"
import { token } from "./auth.mock"

export function client(app: Express) {
  const completeRequest = async (req: Request, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
    if (auth) {
      const access = await token(auth.user, auth.scopes)
      req.set('Authorization', `Bearer ${access}`)
    }
    const response = (await req) as Response
    assert.equal(response.status, status, response.body.errors?.[0]?.detail ?? response.status)
    assert(response.header['content-type'].startsWith("application/vnd.api+json"), "Incorrect content type")
    return response
  }

  const sendData = (req: Request, data: any) => {
    return req.send(data).set('Content-Type', 'application/vnd.api+json')
  }

  return {
    get: async (path: string, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
      return await completeRequest(
        request(app).get(path),
        auth, status)
    },
    post: async (path: string, data: any, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
      return await completeRequest(
        sendData(request(app).post(path), data),
        auth, status)
    },
    patch: async (path: string, data: any, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
      return await completeRequest(
        sendData(request(app).patch(path), data),
        auth, status)
    },
    delete: async (path: string, auth?: {user: string, scopes: Scope[]}, status: number = 200) => {
      return await completeRequest(
        request(app).delete(path),
        auth, status)
    }
  }
}