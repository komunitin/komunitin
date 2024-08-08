import { describe, it } from "node:test"
import { setupServerTest } from "./setup"
import { Scope } from "src/server/auth"
import { fixUrl } from "src/utils/net"

/**
 * Not part of the CI/CD pipeline because it requires a local IntegralCES instance.
 */
describe.skip("Test migration from local IntegralCes instance", async () => {
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

  const getToken = async(baseUrl: string, username: string, password: string) => {
    const response = await fetch(`${fixUrl(baseUrl)}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username,
        password,
        client_id: 'komunitin-app',
        scope: 'openid email profile komunitin_social komunitin_accounting offline_access komunitin_social_read_all'
      })
    })

    const token = await response.json() as any
    return token.access_token
  }

  await it ('migrate local integralces NET1', async () => {
    // Get token
    const mig = migration("NET1")
    mig.data.attributes.source.access_token = await getToken(mig.data.attributes.source.url, "riemann@komunitin.org", "komunitin")
    await t.api.post('/migrations', mig, {user: "12345", scopes: [Scope.Accounting]})
  })

  await it('migrate local integralces NET2', async () => {
    // Get token
    const mig = migration("NET2")
    mig.data.attributes.source.access_token = await getToken(mig.data.attributes.source.url, "fermat@komunitin.org", "komunitin")
    await t.api.post('/migrations', mig, {user: "67890", scopes: [Scope.Accounting]})
  })


  
})