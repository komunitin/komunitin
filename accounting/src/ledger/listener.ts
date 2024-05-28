
import { logger } from "../utils/logger"
import { LedgerAsset, KeyPair, LedgerCurrency, Ledger, LedgerCurrencyState } from "./ledger"

type KeyGetter = () => Promise<KeyPair>
type CurrencyKeyGetter = (currency: LedgerCurrency) => Promise<KeyPair>

export function installDefaultListeners(ledger: Ledger, updateState: (currency: LedgerCurrency, state: LedgerCurrencyState) => Promise<void>, sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
  ledger.addListener("error", defaultErrorListener())
  ledger.addListener("incommingHourTrade", defaultIncommingHourTradeListener(sponsorKeyGetter, traderKeyGetter))
  ledger.addListener("outgoingTrade", defaultOutgoingTradeListener(sponsorKeyGetter, traderKeyGetter))
  ledger.addListener("stateUpdated", updateState)
}

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
    await currency.updateExternalOffer(trade.externalHour, {sponsor: sponsorKey, externalTrader: traderKey})
  }
}
/**
 * Default implementation of the "outgoingTrade" event listener.
 * 
 * Uses the provided getters to get the keys needed and then calls the
 * {LedgerCurrency.updateExternalOffer} method with the local asset.
 */
export function defaultOutgoingTradeListener(sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
  return async (currency: LedgerCurrency) => {
    const sponsorKey = await sponsorKeyGetter()
    const traderKey = await traderKeyGetter(currency)
    await currency.updateExternalOffer(currency.asset(), {sponsor: sponsorKey, externalTrader: traderKey})
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