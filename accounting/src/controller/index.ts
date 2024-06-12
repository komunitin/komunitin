
import { CollectionOptions } from "../server/request"
import { CreateCurrency, Currency, UpdateCurrency, Transfer, Account, InputAccount, UpdateAccount, InputTransfer, UpdateTransfer, AccountSettings } from "../model"
export { createController } from "./controller"
import { Context } from "../utils/context"
import { CreateMigration, Migration } from "./migration/migration"
import TypedEmitter from "typed-emitter"

export type ControllerEvents = {
  /**
   * This event is emitted when a transfer is created, committed,
   * rejected, deleted, etc.
   */
  transferStateChanged: (transfer: Transfer, controller: CurrencyController) => void
}

/**
 * Controller for operations not related to a particular currency.
 */
export interface SharedController {
  
  createCurrency(ctx: Context, currency: CreateCurrency): Promise<Currency>
  getCurrencies(ctx: Context): Promise<Currency[]>

  getCurrencyController(code: string): Promise<CurrencyController>

  createMigration(ctx: Context, migration: CreateMigration): Promise<Migration>
   
  stop(): Promise<void>
  
  addListener: TypedEmitter<ControllerEvents>['addListener']
  removeListener: TypedEmitter<ControllerEvents>['removeListener']
}
/**
 * Controller for operations related to a particular currency.
 */
export interface CurrencyController {
  // Currency
  getCurrency(ctx: Context): Promise<Currency>
  updateCurrency(ctx: Context, currency: UpdateCurrency): Promise<Currency>
  
  // Accounts
  createAccount(ctx: Context, account: InputAccount): Promise<Account>
  getAccount(ctx: Context, id: string): Promise<Account>
  getAccountByCode(ctx: Context, code: string): Promise<Account|undefined>
  getAccountByKey(ctx: Context, key: string): Promise<Account|undefined>
  getAccounts(ctx: Context, params: CollectionOptions): Promise<Account[]>
  updateAccount(ctx: Context, data: UpdateAccount): Promise<Account>;
  deleteAccount(ctx: Context, id: string): Promise<void>;

  getAccountSettings(ctx: Context, id: string): Promise<AccountSettings>
  updateAccountSettings(ctx: Context, settings: AccountSettings): Promise<AccountSettings>
  
  // Transfers
  createTransfer(ctx: Context, transfer: InputTransfer): Promise<Transfer>
  getTransfer(ctx: Context, id: string): Promise<Transfer>
  getTransferByHash(ctx: Context, hash: string): Promise<Transfer>
  getTransfers(ctx: Context, params: CollectionOptions): Promise<Transfer[]>
  updateTransfer(ctx: Context, transfer: UpdateTransfer): Promise<Transfer>
  deleteTransfer(ctx: Context, id: string): Promise<void>
}
