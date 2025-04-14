
import { CollectionOptions } from "../server/request"
import { CreateCurrency, Currency, UpdateCurrency, Transfer, Account, InputAccount, UpdateAccount, InputTransfer, UpdateTransfer, AccountSettings, CurrencySettings } from "../model"
export { createController } from "./base-controller"
import { Context } from "../utils/context"
import TypedEmitter from "typed-emitter"
import { InputTrustline, Trustline, UpdateTrustline } from "src/model/trustline"
export { MigrationController } from './migration'
import { CreditCommonsController } from "src/creditcommons/credit-commons-controller";


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

  getCurrencyController(code: string): Promise<CurrencyController>   
  
  createCurrency(ctx: Context, currency: CreateCurrency): Promise<Currency>
  getCurrencies(ctx: Context, params: CollectionOptions): Promise<Currency[]>

  stop(): Promise<void>
  
  addListener: TypedEmitter<ControllerEvents>['addListener']
  removeListener: TypedEmitter<ControllerEvents>['removeListener']
}
/**
 * Controller for operations related to a particular currency.
 */
export interface CurrencyController {
  // Child controllers
  accounts: AccountController
  transfers: TransferController
  creditCommons: CreditCommonsController

  // Currency
  getCurrency(ctx: Context): Promise<Currency>
  updateCurrency(ctx: Context, currency: UpdateCurrency): Promise<Currency>

  // Currency settings
  getCurrencySettings(ctx: Context): Promise<CurrencySettings>
  updateCurrencySettings(ctx: Context, settings: CurrencySettings): Promise<CurrencySettings>

  // Trustlines
  getTrustline(ctx: Context, id: string): Promise<Trustline>
  createTrustline(ctx: Context, trustline: InputTrustline): Promise<Trustline>
  updateTrustline(ctx: Context, trustline: UpdateTrustline): Promise<Trustline>
  getTrustlines(ctx: Context, params: CollectionOptions): Promise<Trustline[]>
}

export interface AccountController {
  createAccount(ctx: Context, account: InputAccount): Promise<Account>
  getAccount(ctx: Context, id: string): Promise<Account>
  getAccountByCode(ctx: Context, code: string): Promise<Account|undefined>
  getAccountByKey(ctx: Context, key: string): Promise<Account|undefined>
  getAccounts(ctx: Context, params: CollectionOptions): Promise<Account[]>
  updateAccount(ctx: Context, data: UpdateAccount): Promise<Account>;
  deleteAccount(ctx: Context, id: string): Promise<void>;

  getAccountSettings(ctx: Context, id: string): Promise<AccountSettings>
  updateAccountSettings(ctx: Context, settings: AccountSettings): Promise<AccountSettings>
  
}

export interface TransferController {
  createTransfer(ctx: Context, transfer: InputTransfer): Promise<Transfer>
  createMultipleTransfers(ctx: Context, transfers: InputTransfer[]): Promise<Transfer[]>
  getTransfer(ctx: Context, id: string): Promise<Transfer>
  getTransferByHash(ctx: Context, hash: string): Promise<Transfer>
  getTransfers(ctx: Context, params: CollectionOptions): Promise<Transfer[]>
  updateTransfer(ctx: Context, transfer: UpdateTransfer): Promise<Transfer>
  deleteTransfer(ctx: Context, id: string): Promise<void>
}
