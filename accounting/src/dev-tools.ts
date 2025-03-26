import { createApp, closeApp } from "./server/app"
import { Currency } from "./model/currency"
import { Context } from "./utils/context"

async function run() {
    const app = await createApp()
    const admin =  {
      userId: "qwer",
      type: "user",
    }
    const currency = {
        code: "QWER",
        name: "Testy",
        namePlural: "Testies",
        symbol: "T$",
        decimals: 2,
        scale: 4,
        rate: {n: 1, d: 10},
        settings: {
          defaultInitialCreditLimit: 1000,
        },
      } as Currency
    await app.komunitin.controller.createCurrency(admin as Context, currency)
    closeApp(app)
}

// ...
run();