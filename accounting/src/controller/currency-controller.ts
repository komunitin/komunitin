import { Keypair } from "@stellar/stellar-sdk";
import Big from "big.js";
import type { KeyObject } from "node:crypto";
import { recordToExternalResource } from "src/model/resource";
import { InputTrustline, Trustline, recordToTrustline } from "src/model/trustline";
import TypedEmitter from "typed-emitter";
import { ControllerEvents, CurrencyController } from ".";
import { LedgerCurrency, LedgerCurrencyState, LedgerTransfer } from "../ledger";
import {
  Account,
  Currency,
  UpdateCurrency,
  currencyToRecord,
  recordToCurrency
} from "../model";
import { CollectionOptions } from "../server/request";
import { Context, systemContext } from "../utils/context";
import { badRequest, notFound, notImplemented } from "../utils/error";
import { AtLeast } from "../utils/types";
import { AccountController } from "./account-controller";
import { ExternalResourceController, fetchExternalResource } from "./external-resource-controller";
import { KeyController } from "./key-controller";
import { TenantPrismaClient } from "./multitenant";
import { whereFilter } from "./query";
import { TransferController } from "./transfer-controller";
import { UserController } from "./user-controller";

export function amountToLedger(currency: AtLeast<Currency, "scale">, amount: number) {
  return Big(amount).div(Big(10).pow(currency.scale)).toString()
}

export function amountFromLedger(currency: AtLeast<Currency, "scale">, amount: string) {
  return Big(amount).times(Big(10).pow(currency.scale)).toNumber()
}

export function convertAmount(amount: number, from: AtLeast<Currency, "rate">, to: AtLeast<Currency,"rate">) {
  return amount * from.rate.n / from.rate.d * to.rate.d / to.rate.n
}

export class LedgerCurrencyController implements CurrencyController {
  model: Currency
  ledger: LedgerCurrency
  db: TenantPrismaClient
  emitter: TypedEmitter<ControllerEvents>

  // Controllers
  users: UserController
  keys: KeyController
  accounts: AccountController
  transfers: TransferController
  externalResources: ExternalResourceController

  constructor(model: Currency, ledger: LedgerCurrency, db: TenantPrismaClient, encryptionKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>, emitter: TypedEmitter<ControllerEvents>) {
    this.db = db
    this.model = model
    this.ledger = ledger
    this.emitter = emitter

    this.users = new UserController(this)
    this.keys = new KeyController(this, sponsorKey, encryptionKey)
    this.accounts = new AccountController(this)
    this.transfers = new TransferController(this)
    this.externalResources = new ExternalResourceController(this)
  }

  async updateCurrency(ctx: Context, currency: UpdateCurrency) {
    await this.users.checkAdmin(ctx)

    if (currency.code && currency.code !== this.model.code) {
      throw badRequest("Can't change currency code")
    }
    if (currency.id && currency.id !== this.model.id) {
      throw badRequest("Can't change currency id")
    }
    if (currency.rate && (currency.rate.n !== this.model.rate.n || currency.rate.d !== this.model.rate.d)) {
      throw notImplemented("Change the currency rate not implemented yet")
    }
    
    // Merge settings with existing settings as otherwise the DB will overwrite the whole settings object.
    if (currency.settings !== undefined) {
      currency.settings = {
        ...this.model.settings,
        ...(currency.settings)
      }
    }
    const data = currencyToRecord(currency)
    const record = await this.db.currency.update({
      data,
      where: {
        id: this.model.id
      },
      include: {
        externalAccount: true
      }
    })
    this.model = recordToCurrency(record)

    // Note that changing default currency options don't affect existing account options
    // (eg credit limit), so no heavy lifting is required.

    return this.model
  }

  /**
   * Implements {@link CurrencyController.getCurrency}
   */
  public async getCurrency(_ctx: Context): Promise<Currency> {
    return this.model
  }

  async updateState(state: LedgerCurrencyState) {
    await this.db.currency.update({
      data: { state },
      where: { id: this.model.id }
    })
    this.model.state = state
  }
  
  

  public amountToLedger(amount: number) {
    return amountToLedger(this.model, amount)
  }

  public amountFromLedger(amount: string) {
    return amountFromLedger(this.model, amount)
  }

  async cron(ctx: Context) {
    if (this.model.settings.defaultAcceptPaymentsAfter !== undefined) {
      await this.transfers.acceptPendingTransfers(ctx)
    }
  }

  async createTrustline(ctx: Context, data: InputTrustline): Promise<Trustline> {
    // Only the currency owner can create trustlines.
    await this.users.checkAdmin(ctx)

    const trustedExternalResource = await this.externalResources.getExternalResource<Currency>(ctx, data.trusted)
    const trustedCurrency = trustedExternalResource.resource

    // Create the trustline in the ledger.
    await this.ledger.trustCurrency({
      trustedPublicKey: trustedCurrency.keys?.externalIssuer as string,
      limit: this.amountToLedger(data.limit)
    }, {
      sponsor: await this.keys.sponsorKey(),
      externalTrader: await this.keys.externalTraderKey(),
      externalIssuer: await this.keys.externalIssuerKey()
    })

    // Store trustline in DB with 0 initial balance
    const record = await this.db.trustline.create({
      data: {
        limit: data.limit,
        balance: 0,

        trusted: { connect: { id: trustedExternalResource.id } },
        currency: { connect: { id: this.model.id } }
      }
    })
    const trustline = recordToTrustline(record, trustedExternalResource, this.model)
    return trustline
  }

  async getTrustlines(ctx: Context, params: CollectionOptions): Promise<Trustline[]> {
    await this.users.checkUser(ctx)

    const filter = whereFilter(params.filters)

    const records = await this.db.trustline.findMany({
      where: {
        currencyId: this.model.id, // redundant due to multitenancy isolation
        ...filter
      },
      include: {
        trusted: true
      },
      orderBy: {
        [params.sort.field]: params.sort.order
      },
      skip: params.pagination.cursor,
      take: params.pagination.size,
    })
    
    return records.map(r => recordToTrustline(r, recordToExternalResource<Currency>(r.trusted), this.model))
  }

  async getTrustline(ctx: Context, id: string): Promise<Trustline> {
    await this.users.checkUser(ctx)

    const record = await this.db.trustline.findFirst({
      where: {
        id,
        currencyId: this.model.id,
      },
      include: {
        trusted: true
      }
    })
    if (!record) {
      throw notFound(`Trustline id ${id} not found in currency ${this.model.code}`)
    }
    return recordToTrustline(record, recordToExternalResource<Currency>(record.trusted), this.model)
  }

  /** 
   * To be called after a local transfer is committed to the ledger.
  */
  async handleTransferEvent(ledgerTransfer: LedgerTransfer) {
    const payerAccount =  await this.accounts.getAccountByKey(systemContext(), ledgerTransfer.payer)
    if (payerAccount) {
      // The payer may not be found if it is one of the system accounts such as the credit account.
      await this.accounts.updateAccountBalance(payerAccount)
    }
    const payeeAccount = await this.accounts.getAccountByKey(systemContext(), ledgerTransfer.payee)
    if (payeeAccount) {
      await this.accounts.updateAccountBalance(payeeAccount)
    }
  }

  async handleIncommingTransferEvent(ledgerTransfer: LedgerTransfer) {
    const payeeAccount = await this.accounts.getAccountByKey(systemContext(), ledgerTransfer.payee)
    await this.accounts.updateAccountBalance(payeeAccount as Account)
    const payerAccount = this.model.externalAccount
    await this.accounts.updateAccountBalance(payerAccount)
  }

  async handleOutgoingTransferEvent(ledgerTransfer: LedgerTransfer) {
    const payerAccount = await this.accounts.getAccountByKey(systemContext(), ledgerTransfer.payer)
    await this.accounts.updateAccountBalance(payerAccount as Account)
    const payeeAccount = this.model.externalAccount
    await this.accounts.updateAccountBalance(payeeAccount)
  }
}