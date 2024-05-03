
import { logger } from "../utils/logger"
import { LedgerAsset, KeyPair, LedgerCurrency } from "./ledger"

type KeyGetter = () => Promise<KeyPair>
type CurrencyKeyGetter = (currency: LedgerCurrency) => Promise<KeyPair>

/**
 * Default implementation of the "incommingHourTrade" event listener.
 * 
 * Uses the provided getters to get the keys needed and then calls the 
 * {LedgerCurrency.updateExternalHourOffer} method.
 */
export function defaultIncommingHourTradeListener (sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
  return async (currency: LedgerCurrency, trade: {
    externalHour: LedgerAsset
  }) => {
    const sponsorKey = await sponsorKeyGetter()
    const traderKey = await traderKeyGetter(currency)
    await currency.updateExternalHourOffer(trade.externalHour, {sponsor: sponsorKey, externalTrader: traderKey})
  }
}

/**
 * Default implementation of the "error" event listener.
 * 
 * Just logs the error.
 */
export function defaultErrorListener() {
  return (error:Error) => {
    logger.error(error)
  }
}