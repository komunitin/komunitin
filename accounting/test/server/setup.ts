import { before, after } from "node:test"
import { TestApiClient, client } from "./net.client"
import { clearEvents, startServer, stopServer } from "./net.mock"
import { clearDb } from "./db"
import { createApp, closeApp, ExpressExtended, setupApp } from "../../src/server/app"
import { testAccount, testCurrency, testTransfer, testCreditCommonsNeighbour, userAuth } from "./api.data"
import express from "express"
import expressOasGenerator from "express-oas-generator"
import { expressOasGeneratorOptions } from "./openapi.generator.options"

type UserAuth = ReturnType<typeof userAuth>

interface TestSetup {
  app: ExpressExtended,
  api: TestApiClient,
  createAccount: (user: string, code?: string, admin?: UserAuth) => Promise<any>,
  payment: (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus?: number) => Promise<any>,
}

export interface TestSetupWithCurrency extends TestSetup {
  admin: UserAuth,
  user1: UserAuth,
  user2: UserAuth,
  currency: any,
  account0: any,
  account1: any,
  account2: any,
}

export function setupServerTest(createData: false): TestSetup;
export function setupServerTest(createData: true, graftCreditCommons: boolean): TestSetupWithCurrency;
export function setupServerTest(): TestSetupWithCurrency;

export function setupServerTest(createData: boolean = true, graftCreditCommons: boolean = false): TestSetupWithCurrency {
  const test = {
    app: undefined as any as ExpressExtended,
    api: undefined as any as TestApiClient,
    admin: userAuth("0"),
    user1: userAuth("1"),
    user2: userAuth("2"),
    user3: userAuth("bob"),
    currency: undefined as any,
    account0: undefined as any,
    account1: undefined as any,
    account2: undefined as any,
    ccNeighbour: { ccNodeName: 'trunk', lastHash: 'trunk' },

    createAccount: async (user: string, code = "TEST", admin = userAuth("0")) => {
      const response = await test.api?.post(`/${code}/accounts`, testAccount(user), admin)
      return response.body.data
    },

    payment: async (payer: string, payee: string, amount: number, meta: string, state: string, auth: any, httpStatus = 201) => {
      const response = await test.api?.post('/TEST/transfers', testTransfer(payer, payee, amount, meta, state), auth, httpStatus)
      return response.body.data
    },

    createCreditCommonsNeighbour: async (ccNodeName: string, lastHash: string, admin = userAuth("0")) => {
      await test.api?.post('/TEST/creditCommonsNodes', testCreditCommonsNeighbour(ccNodeName, lastHash), admin)
    }
  }

  before(async () => {
    await clearDb()
    const app = express()
    
    expressOasGenerator.handleResponses(app, expressOasGeneratorOptions)    
    test.app = await setupApp(app)
    expressOasGenerator.handleRequests()

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
      // Create CC trunkward
      if (graftCreditCommons) {
        await test.createCreditCommonsNeighbour(test.ccNeighbour.ccNodeName, test.ccNeighbour.lastHash)
      }
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

