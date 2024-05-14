
import { CollectionOptions } from "../server/request";
import { Account, InputAccount } from "../model/account";
import { InputCurrency, Currency } from "../model/currency";
export { createController } from "./controller";
/**
 * Controller for operations not related to a particular currency.
 */
export interface SharedController {
  createCurrency(currency: InputCurrency): Promise<Currency>
  getCurrencies(): Promise<Currency[]>
  getCurrency(code: string): Promise<Currency | undefined>
  getCurrencyController(code: string): Promise<CurrencyController>
}
/**
 * Controller for operations related to a particular currency.
 */
export interface CurrencyController {
  createAccount(account: InputAccount): Promise<Account>
  getAccount(id: string): Promise<Account>
  getAccountByCode(code: string): Promise<Account>
  getAccounts(params: CollectionOptions): Promise<Account[]>
}
