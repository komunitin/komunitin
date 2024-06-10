import { describe, it } from "node:test"
import { setupServerTest } from "./setup"
import { Scope } from "src/server/auth"

describe("Test migration from local IntegralCes instance", async () => {
  const t = setupServerTest(false)
  const migration = (code: string, access_token?: string) => ({
    data: {
      type: "migrations",
      attributes: {
        code,
        source: {
          platform: "integralces",
          url: "http://localhost:2029",
          access_token,
        }
      }
    }
  })

  it ('migrate local integralces NET1', async () => {
    // Get token
    const mig = migration("NET1")
    const response = await fetch(`${mig.data.attributes.source.url}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: 'riemann@integralces.net',
        password: 'integralces',
        client_id: 'komunitin-app',
        scope: 'openid email profile komunitin_social komunitin_accounting offline_access komunitin_social_read_all'
      })
    })

    const token = await response.json() as any
    mig.data.attributes.source.access_token = token.access_token
    
    await t.api.post('/migrations', mig, {user: "12345", scopes: [Scope.Accounting]})

  })
  
})