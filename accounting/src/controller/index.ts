
import { CollectionOptions } from "../server/request";
import { CreateCurrency, Currency, UpdateCurrency, Transfer, Account, InputAccount, UpdateAccount } from "../model";
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
  
  // Accounts
  createAccount(account: InputAccount): Promise<Account>
  getAccounts(params: CollectionOptions): Promise<Account[]>
  getAccount(id: string): Promise<Account>
  getAccountByCode(code: string): Promise<Account|undefined>
  updateAccount(data: UpdateAccount): Promise<Account>;
  
  // Transfers
  createTransfer(transfer: InputTransfer): Promise<Transfer>
}
