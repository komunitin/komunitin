
import { createApp } from "./server/app"
import { systemContext } from "./utils/context"
import { Currency } from "./model/currency"

async function run() {
    const app = await createApp()
    const currency = {
        code: "TEST",
        name: "Testy",
        namePlural: "Testies",
        symbol: "T$",
        decimals: 2,
        scale: 4,
        rate: {n: 1, d: 10},
      } as Currency
    app.komunitin.controller.createCurrency(systemContext(), currency)
}

// ...
run();