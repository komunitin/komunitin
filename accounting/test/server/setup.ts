import { before, after } from "node:test"
import { client } from "./net.client"
import { server } from "./net.mock"
import { clearDb } from "./db"
import { createApp, closeApp, ExpressExtended } from "../../src/server/app"
import { testAccount, testCurrency, testTransfer, userAuth } from "./api.data"

export function setupServerTest() {
  const test = {
    app: undefined as any as ExpressExtended,
    api: undefined as any as ReturnType<typeof client>,
    admin: userAuth("0"),
    user1: userAuth("1"),
    user2: userAuth("2"),
    account0: undefined as any,
    account1: undefined as any,
    account2: undefined as any,

    createAccount: async (user: string) => {
      const response = await test.api?.post('/TEST/accounts', testAccount(user), test.admin)
      return response.body.data
    },

    payment: async (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus = 200) => {
      const response = await test.api?.post('/TEST/transfers', testTransfer(payer, payee, amount, meta, state), auth, httpStatus)
      return response.body.data
    }
  }

  before(async () => {
    await clearDb()
    test.app = await createApp()
    test.api = client(test.app)
    server.listen({ onUnhandledRequest: "bypass" })

    // Create currency TEST
    await test.api.post('/currencies', testCurrency(), test.admin)
    // Create 3 accounts
    test.account0 = await test.createAccount(test.admin.user)
    test.account1 = await test.createAccount(test.user1.user)
    test.account2 = await test.createAccount(test.user2.user)
  })

  after(async () => {
    server.close()
    if (test.app) {
      await closeApp(test.app)
    }
  })

  return test
}
