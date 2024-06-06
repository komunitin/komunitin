import { LedgerCurrency, LedgerTransfer } from "src/ledger";
import { SharedController } from "..";
import { systemContext } from "src/utils/context";
import { amountFromLedger } from "../currency";

export const initUpdateCreditOnPayment = (controller: SharedController) => {
  const onTransfer = async (_ledgerCurrency: LedgerCurrency, transfer: LedgerTransfer) => {
    const code = transfer.asset.code // dest asset in case of external transfer.
    const ctx = systemContext()
    const currency = await controller.getCurrency(ctx, code)
    // Check if the currency supports this feature.
    if (currency.settings.defaultOnPaymentCreditLimit !== undefined ) {
      // Don't handle payments from the credit account as it would be an infinite recursion.
      if (transfer.payer == currency.keys?.credit) {
        return
      }
      // Load account settings
      const currencyController = await controller.getCurrencyController(code)
      const account = await currencyController.getAccountByKey(ctx, transfer.payee)
      if (!account) {
        // This is an error because it means we've noticed a transfer to an account that is
        // not in our database.
        throw new Error(`Account not found in the DB for currency ${code} and key ${transfer.payee}.`)
      }
      const maxLimit = account.settings.onPaymentCreditLimit ?? currency.settings.defaultOnPaymentCreditLimit
      if (account.creditLimit < maxLimit) {
        const newLimit = Math.min(maxLimit, account.creditLimit + amountFromLedger(currency, transfer.amount))
        await currencyController.updateAccount(ctx, {
          id: account.id,
          creditLimit: newLimit
        })
      }
    }
  }  

  controller.getLedger().addListener("transfer", onTransfer)
}