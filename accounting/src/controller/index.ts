
import { CollectionOptions } from "../server/request";
import { Account, InputAccount } from "../model/account";
import { CreateCurrency, Currency, UpdateCurrency } from "../model/currency";
export { createController } from "./controller";
/**
 * Controller for operations not related to a particular currency.
 */
export interface SharedController {
  createCurrency(currency: CreateCurrency): Promise<Currency>
  getCurrencies(): Promise<Currency[]>
  getCurrency(code: string): Promise<Currency | undefined>
  getCurrencyController(code: string): Promise<CurrencyController>
}
/**
 * Controller for operations related to a particular currency.
 */
export interface CurrencyController {
  update(currency: UpdateCurrency): Promise<Currency>
  createAccount(account: InputAccount): Promise<Account>
  getAccount(id: string): Promise<Account>
  getAccountByCode(code: string): Promise<Account>
  getAccounts(params: CollectionOptions): Promise<Account[]>
}
