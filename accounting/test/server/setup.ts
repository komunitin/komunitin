import { before, after } from "node:test"
import { TestApiClient, client } from "./net.client"
import { clearEvents, startServer, stopServer } from "./net.mock"
import { clearDb } from "./db"
import { createApp, closeApp, ExpressExtended } from "../../src/server/app"
import { testAccount, testCurrency, testTransfer, userAuth } from "./api.data"

type UserAuth = ReturnType<typeof userAuth>

interface TestSetup {
  app: ExpressExtended,
  api: TestApiClient,
  createAccount: (user: string, code?: string, admin?: UserAuth) => Promise<any>,
  payment: (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus?: number) => Promise<any>,
}

interface TestSetupWithCurrency extends TestSetup {
  admin: UserAuth,
  user1: UserAuth,
  user2: UserAuth,
  currency: any,
  account0: any,
  account1: any,
  account2: any,
}

export function setupServerTest(createData: false): TestSetup;
export function setupServerTest(createData: true): TestSetupWithCurrency;
export function setupServerTest(): TestSetupWithCurrency;

export function setupServerTest(createData: boolean = true): TestSetupWithCurrency {
  const test = {
    app: undefined as any as ExpressExtended,
    api: undefined as any as TestApiClient,
    admin: userAuth("0"),
    user1: userAuth("1"),
    user2: userAuth("2"),
    currency: undefined as any,
    account0: undefined as any,
    account1: undefined as any,
    account2: undefined as any,

    createAccount: async (user: string, code = "TEST", admin = userAuth("0")) => {
      const response = await test.api?.post(`/${code}/accounts`, testAccount(user), admin)
      return response.body.data
    },

    payment: async (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus = 201) => {
      const response = await test.api?.post('/TEST/transfers', testTransfer(payer, payee, amount, meta, state), auth, httpStatus)
      return response.body.data
    }
  }

  before(async () => {
    await clearDb()
    test.app = await createApp()
    test.api = client(test.app)
    startServer(test.app)
    clearEvents()

    if (createData) {
      // Create currency TEST
      const currency = await test.api.post('/currencies', testCurrency(), test.admin)
      test.currency = currency.body.data
      // Create 3 accounts
      test.account0 = await test.createAccount(test.admin.user)
      test.account1 = await test.createAccount(test.user1.user)
      test.account2 = await test.createAccount(test.user2.user)
    }
  })

  after(async () => {
    stopServer()
    if (test.app) {
      await closeApp(test.app)
    }
  })

  return test
}
