import { LedgerCurrency } from "../ledger";
import { CurrencyController } from ".";
import { Account, InputAccount, accountFromRecord } from "../model/account";
import { TenantPrismaClient } from "./multitenant";
import { Keypair } from "@stellar/stellar-sdk";
import { decrypt, encrypt } from "src/utils/crypto";
import type {KeyObject} from "node:crypto"
import { CreateCurrency, Currency, UpdateCurrency, currencyToRecord, recordToCurrency } from "src/model/currency";
import { badRequest, notFound, notImplemented } from "src/utils/error";
import { CollectionOptions } from "src/server/request";
import { whereFilter } from "./filter";

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

  async update(currency: UpdateCurrency) {
    if (currency.code !== this.model.code) {
      throw badRequest("Can't change currency code")
    }
    if (currency.id !== this.model.id) {
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

  /**
   * Implements {@link CurrencyController.createAccount}
   */
  async createAccount(account: InputAccount): Promise<Account> {
    // Find next free account code.
    const code = await this.getFreeCode()
    // get required keys from DB.
    const keys = {
      issuer: await this.retrieveKey(this.model.keys?.issuer as string),
      credit: this.model.defaultCreditLimit > 0 ? await this.retrieveKey(this.model.keys?.credit as string) : undefined,
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
        keyId,
        creditLimit: this.model.defaultCreditLimit,
        maximumBalance: this.model.defaultMaximumBalance,
        balance: 0,
        currencyId: this.model.id
      }
    })
    return accountFromRecord(record, this.model)
  }

  /**
   * Implements {@link CurrencyController.getAccount}
   */
  async getAccount(id: string): Promise<Account> {
    const record = await this.db.account.findUnique({
      where: { id }
    })
    if (!record) {
      throw notFound(`Account id ${id} not found in currency ${this.model.code}.`)
    }
    return accountFromRecord(record, this.model)
  }

  /**
   * Implements {@link CurrencyController.getAccountByCode}
   */
  async getAccountByCode(code: string): Promise<Account> {
    const record = await this.db.account.findUnique({
      where: { code }
    })
    if (!record) {
      throw notFound(`Account code ${code} not found in currency ${this.model.code}.`)
    }
    return accountFromRecord(record, this.model)
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

    return records.map(r => accountFromRecord(r, this.model))
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