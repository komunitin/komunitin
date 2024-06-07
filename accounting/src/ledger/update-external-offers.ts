
import { LedgerAsset, KeyPair, LedgerCurrency, Ledger } from "./ledger"

type KeyGetter = () => Promise<KeyPair>
type CurrencyKeyGetter = (currency: LedgerCurrency) => Promise<KeyPair>

/**
 * Ensures that the external account has its trade offers updated after any external trade is made.
 */
export function initUpdateExternalOffers(ledger: Ledger, sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
  ledger.addListener("incommingHourTrade", defaultIncommingHourTradeListener(sponsorKeyGetter, traderKeyGetter))
  ledger.addListener("outgoingTrade", defaultOutgoingTradeListener(sponsorKeyGetter, traderKeyGetter))
}

/**
 * Default implementation of the "incommingHourTrade" event listener.
 * 
 * Uses the provided getters to get the keys needed and then calls the 
 * {LedgerCurrency.updateExternalHourOffer} method.
 */
function defaultIncommingHourTradeListener (sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
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
function defaultOutgoingTradeListener(sponsorKeyGetter: KeyGetter, traderKeyGetter: CurrencyKeyGetter) {
  return async (currency: LedgerCurrency) => {
    const sponsorKey = await sponsorKeyGetter()
    const traderKey = await traderKeyGetter(currency)
    await currency.updateExternalOffer(currency.asset(), {sponsor: sponsorKey, externalTrader: traderKey})
  }
}
