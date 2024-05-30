import { Scope } from "src/server/auth"

export const testCurrency = () => ({
  data: {
    type: "currencies",
    attributes: {
      code: "TEST",
      name: "Testy",
      namePlural: "Testies",
      symbol: "T$",
      decimals: 2,
      scale: 4,
      rate: {n: 1, d: 10},
      defaultCreditLimit: 1000
    }
  }
})

export const testAccount = (userId: string) => ({
  data: {
    relationships: {
      users: { data: [{ type: "users", id: userId }] }
    }
  },
  included: [{ type: "users", id: userId }]
})

export const testTransfer = (payerId: string, payeeId: string, amount: number, meta: string, state: string) => ({
  data: {
    attributes: {
      amount,
      meta,
      state
    },
    relationships: {
      payer: { data: { type: "accounts", id: payerId }},
      payee: { data: { type: "accounts", id: payeeId }}
    }
  }
})

export const userAuth = (userId: string) => ({
  user: userId,
  scopes: [Scope.Accounting]
})


