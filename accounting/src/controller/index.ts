
import { CollectionOptions } from "../server/request";
import { CreateCurrency, Currency, UpdateCurrency, Transfer, Account, InputAccount, UpdateAccount, InputTransfer } from "../model";
export { createController } from "./controller";
import { Context } from "../utils/context";
/**
 * Controller for operations not related to a particular currency.
 */
export interface SharedController {
  createCurrency(ctx: Context, currency: CreateCurrency): Promise<Currency>
  getCurrencies(ctx: Context): Promise<Currency[]>
  getCurrency(ctx: Context, code: string): Promise<Currency>

  getCurrencyController(code: string): Promise<CurrencyController>
  stop(): Promise<void>
}
/**
 * Controller for operations related to a particular currency.
 */
export interface CurrencyController {
  // Currency
  update(ctx: Context, currency: UpdateCurrency): Promise<Currency>
  
  // Accounts
  createAccount(ctx: Context, account: InputAccount): Promise<Account>
  getAccounts(ctx: Context, params: CollectionOptions): Promise<Account[]>
  getAccount(ctx: Context, id: string): Promise<Account>
  getAccountByCode(ctx: Context, code: string): Promise<Account|undefined>
  updateAccount(ctx: Context, data: UpdateAccount): Promise<Account>;
  deleteAccount(ctx: Context, id: string): Promise<void>;
  
  // Transfers
  createTransfer(ctx: Context, transfer: InputTransfer): Promise<Transfer>
}
