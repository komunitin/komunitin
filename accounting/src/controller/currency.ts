import { LedgerCurrency, LedgerCurrencyState } from "../ledger";
import { CurrencyController } from ".";
import { Account, InputAccount, UpdateAccount, recordToAccount } from "../model/account";
import { TenantPrismaClient } from "./multitenant";
import { Keypair } from "@stellar/stellar-sdk";
import { decrypt, encrypt } from "src/utils/crypto";
import type {KeyObject} from "node:crypto"
import { CreateCurrency, Currency, UpdateCurrency, currencyToRecord, recordToCurrency } from "src/model/currency";
import { badRequest, notFound, notImplemented } from "src/utils/error";
import { CollectionOptions } from "src/server/request";
import { whereFilter } from "./filter";
import { InputTransfer, Transfer, TransferState, recordToTransfer } from "src/model";

/**
 * Return the Key id (= the public key).
 */
export async function storeCurrencyKey(key: Keypair, db: TenantPrismaClient, encryptionKey: () => Promise<KeyObject>) {
  const id = key.publicKey()
  const encryptedSecret = await encrypt(key.secret(), await encryptionKey())
  return (await db.encryptedSecret.create({
    data: {
      id,
      encryptedSecret
    }
  })).id
}

export class LedgerCurrencyController implements CurrencyController {
  model: Currency
  ledger: LedgerCurrency
  db: TenantPrismaClient

  private encryptionKey: () => Promise<KeyObject>
  private sponsorKey: () => Promise<Keypair>

  constructor(model: Currency, ledger: LedgerCurrency, db: TenantPrismaClient, encryptionKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>) {
    this.db = db
    this.model = model
    this.ledger = ledger
    this.encryptionKey = encryptionKey
    this.sponsorKey = sponsorKey
  }

  creditKey() {
    return this.retrieveKey(this.model.keys?.credit as string)
  }
  externalTraderKey() {
    return this.retrieveKey(this.model.keys?.externalTrader as string)
  }
  adminKey() {
    return this.retrieveKey(this.model.keys?.admin as string)
  }

  async update(currency: UpdateCurrency) {
    if (currency.code && currency.code !== this.model.code) {
      throw badRequest("Can't change currency code")
    }
    if (currency.id && currency.id !== this.model.id) {
      throw badRequest("Can't change currency id")
    }
    if (currency.rate && (currency.rate.n !== this.model.rate.n || currency.rate.d !== this.model.rate.d)) {
      throw notImplemented("Change the currency rate not implemented yet")
    }
    // Note that changing defaultMaximumBalance or defaultCreditLimit does not affect existing accounts so
    // no heavy lifting to do.

    const data = currencyToRecord(currency)
    const record = await this.db.currency.update({
      data,
      where: {
        id: this.model.id
      }
    })
    this.model = recordToCurrency(record)
    return this.model
  }

  async updateState(state: LedgerCurrencyState) {
    await this.db.currency.update({
      data: { ...state },
      where: { id: this.model.id }
    })
    this.model.state = state
  }

  /**
   * Implements {@link CurrencyController.createAccount}
   */
  async createAccount(account: InputAccount): Promise<Account> {
    // Find next free account code.
    const code = await this.getFreeCode()
    // get required keys from DB.
    const keys = {
      issuer: await this.retrieveKey(this.model.keys?.issuer as string),
      credit: this.model.defaultCreditLimit > 0 ? await this.creditKey() : undefined,
      sponsor: await this.sponsorKey()
    }
    // Create account in ledger
    const {key} = await this.ledger.createAccount(keys)
    // Store key
    const keyId = await this.storeKey(key)
    // Store account in DB
    const record = await this.db.account.create({
      data: {
        code,
        creditLimit: this.model.defaultCreditLimit,
        maximumBalance: this.model.defaultMaximumBalance,
        balance: 0,

        currency: { connect: { id: this.model.id } },
        key: { connect: { id: keyId } }
      }
    })
    return recordToAccount(record, this.model)
  }

  async updateAccount(data: UpdateAccount): Promise<Account> {
    const account = await this.getAccount(data.id)
    // code, creditLimit and maximumBalance can be updated
    if (data.code && data.code !== account.code) {
      const existing = await this.getAccountByCode(data.code)
      if (existing) {
        throw badRequest(`Code ${data.code} is already in use`)
      }
      if (!data.code.startsWith(this.model.code)) {
        throw badRequest(`Code must start with ${this.model.code}`)
      }
    }
    // Update credit limit
    if (data.creditLimit && data.creditLimit !== account.creditLimit) {
      const ledgerAccount = await this.ledger.getAccount(account.key)
      await ledgerAccount.updateCredit(String(data.creditLimit), {
        sponsor: await this.sponsorKey(),
        credit: data.creditLimit > account.creditLimit ? await this.creditKey() : undefined,
        account: data.creditLimit < account.creditLimit ? await this.adminKey() : undefined
      })
    }
    // Update maximum balance
    if (data.maximumBalance && data.maximumBalance !== account.maximumBalance) {
      throw notImplemented("Updating maximum balance not implemented")
    }
    // Update db.
    const updated = await this.db.account.update({
      data,
      where: {id: account.id}
    })

    return recordToAccount(updated, this.model)
  }

  /**
   * Implements {@link CurrencyController.getAccount}
   */
  async getAccount(id: string): Promise<Account> {
    const record = await this.db.account.findUnique({
      where: { id }
    })
    if (!record) {
      throw notFound(`Account id ${id} not found in currency ${this.model.code}`)
    }
    return recordToAccount(record, this.model)
  }

  /**
   * Implements {@link CurrencyController.getAccountByCode}
   */
  async getAccountByCode(code: string): Promise<Account|undefined> {
    const record = await this.db.account.findUnique({
      where: { code }
    })
    if (!record) {
      return undefined
    }
    return recordToAccount(record, this.model)
  }

  async getAccounts(params: CollectionOptions): Promise<Account[]> {
    // Allow filtering by code and by id.
    const filter = whereFilter(params.filters)
    
    const records = await this.db.account.findMany({
      where: {
        currencyId: this.model.id,
        ...filter,
      },
      orderBy: {
        [params.sort.field]: params.sort.order
      },
      skip: params.pagination.cursor,
      take: params.pagination.size,
    })

    return records.map(r => recordToAccount(r, this.model))
  }

  /**
   * Implements CurrencyController.createTransfer()
   */
  async createTransfer(data: InputTransfer): Promise<Transfer> {
    // Check id. Allow for user-defined ids, but check for duplicates.
    if (data.id) {
      const existing = await this.db.transfer.findUnique({where: {id: data.id}})
      if (existing) {
        throw badRequest(`Transfer with id ${data.id} already exists`)
      }
    }
    if (!["new", "committed"].includes(data.state)) {
      throw badRequest(`Invalid transfer state ${data.state}`)
    }
    if (data.amount <= 0) {
      throw badRequest("Transfer amount must be positive")
    }
    if (!data.payerId) {
      throw badRequest("Payer account id is required")
    }
    if (!data.payeeId) {
      throw badRequest("Payee account id is required")
    }
    if (data.payerId == data.payeeId) {
      throw badRequest("Payer and payee must be different")
    }
    // Already throw if not found.
    const payer = await this.getAccount(data.payerId)
    const payee = await this.getAccount(data.payeeId)
    // Check that both accounts are in the same currency (although that should be the case due to DB RLS).
    if (payer.currency.id !== payee.currency.id) {
      throw badRequest("Payer and payee must be in the same currency")
    }
    // Create the transaction in the DB
    const record = await this.db.transfer.create({
      data: {
        id: data.id,
        state: "new",
        amount: data.amount,
        meta: data.meta,
        payer: { connect: { id: payer.id } },
        payee: { connect: { id: payee.id } }
      }
    })
    let transfer = recordToTransfer(record, {payer,payee})
    
    if (data.state === "committed") {
      transfer = await this.setTransferState(transfer, "committed")
    }

    return transfer
  }

  /**
   * Moves the transfer to the specified state. This function does not check authorisation.
   * @returns 
   */
  private async setTransferState(transfer: Transfer, state: TransferState) {
    // "new" | "accepted" => "committed" | "failed"
    if (state == "committed" && ["new", "accepted"].includes(transfer.state)) {
      transfer.state = "submitted"
      try {
        const transaction = await this.submitTransfer(transfer)
        transfer.hash = transaction.hash
        transfer.state = "committed"
      } catch (e) {
        transfer.state = "failed"
        throw e
      } finally {
        await this.db.transfer.update({
          data: {
            state: transfer.state,
            hash: transfer.hash
          },
          where: {id: transfer.id}
        })
      }
    }
    else {
      throw notImplemented(`Transition from "${transfer.state}" to "${state}" not implemented`)
    }
    
    return transfer
  }

  private async submitTransfer(transfer: Transfer) {
    const ledgerPayer = await this.ledger.getAccount(transfer.payer.key)
    const transaction = await ledgerPayer.pay({
      payeePublicKey: transfer.payee.key,
      amount: String(transfer.amount),
    }, {
      sponsor: await this.sponsorKey(),
      account: await this.retrieveKey(transfer.payer.key)
    })
    return transaction
  }


  private async getFreeCode() {
    // We look for the maximum code of type "CODE1234", so we can have other codes ("CODESpecial").
    // Code numbers can have any length but are zero-padded if they are less than 10K.
    const result = await this.db.$queryRaw`SELECT MAX(substring(code from 4)::int) FROM Account WHERE code ~ '${this.model.code}[0-9]+'` as {code: string}
    const codeNum = result ? parseInt(result.code) + 1 : 0
    const code = this.model.code + String(codeNum).padStart(4, "0")
    return code
  }

  private async storeKey(key: Keypair) {
    return await storeCurrencyKey(key, this.db, this.encryptionKey)
  }

  private async retrieveKey(id: string) {
    const result = await this.db.encryptedSecret.findUniqueOrThrow({
      where: { id }
    })
    const secret = await decrypt(result.encryptedSecret, await this.encryptionKey())
    return Keypair.fromSecret(secret)
  }
  
}