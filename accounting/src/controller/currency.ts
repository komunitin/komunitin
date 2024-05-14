import { LedgerController } from "./controller";
import { LedgerCurrency } from "../ledger";
import { CurrencyController } from ".";
import { Account, InputAccount, accountFromRecord } from "../model/account";
import { Currency as CurrencyRecord, Account as AccountRecord } from "@prisma/client";

import { TenantPrismaClient } from "./multitenant";
import { Keypair } from "@stellar/stellar-sdk";
import { decrypt, encrypt } from "src/utils/crypto";
import type {KeyObject} from "node:crypto"
import { currencyFromRecord } from "src/model/currency";
import { notFound } from "src/utils/error";
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
  controller: LedgerController
  record: CurrencyRecord
  ledger: LedgerCurrency
  db: TenantPrismaClient
  private encryptionKey: () => Promise<KeyObject>
  private sponsorKey: () => Promise<Keypair>

  constructor(controller: LedgerController, record: CurrencyRecord, ledger: LedgerCurrency, db: TenantPrismaClient, encryptionKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>) {
    this.controller = controller
    this.db = db
    this.record = record
    this.ledger = ledger
    this.encryptionKey = encryptionKey
    this.sponsorKey = sponsorKey
  }

  /**
   * Implements {@link CurrencyController.createAccount}
   */
  async createAccount(account: InputAccount): Promise<Account> {
    // Find next free account code.
    const code = await this.getFreeCode()
    // get required keys from DB.
    const keys = {
      issuer: await this.retrieveKey(this.record.issuerKeyId as string),
      credit: this.record.defaultCreditLimit > 0 ? await this.retrieveKey(this.record.creditKeyId as string) : undefined,
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
        creditLimit: this.record.defaultCreditLimit,
        maximumBalance: this.record.defaultMaximumBalance,
        balance: 0,
        currencyId: this.record.id
      }
    })
    return accountFromRecord(record, currencyFromRecord(this.record))
  }

  /**
   * Implements {@link CurrencyController.getAccount}
   */
  async getAccount(id: string): Promise<Account> {
    const record = await this.db.account.findUnique({
      where: { id }
    })
    if (!record) {
      throw notFound(`Account id ${id} not found in currency ${this.record.code}.`)
    }
    return accountFromRecord(record, currencyFromRecord(this.record))
  }

  /**
   * Implements {@link CurrencyController.getAccountByCode}
   */
  async getAccountByCode(code: string): Promise<Account> {
    const record = await this.db.account.findUnique({
      where: { code }
    })
    if (!record) {
      throw notFound(`Account code ${code} not found in currency ${this.record.code}.`)
    }
    return accountFromRecord(record, currencyFromRecord(this.record))
  }

  async getAccounts(params: CollectionOptions): Promise<Account[]> {
    // Allow filtering by code and by id.
    const filter = whereFilter(params.filters)
    
    const records = await this.db.account.findMany({
      where: {
        currencyId: this.record.id,
        ...filter,
      },
      orderBy: {
        [params.sort.field]: params.sort.order
      },
      skip: params.pagination.cursor,
      take: params.pagination.size,
    })

    const currency = currencyFromRecord(this.record)
    return records.map(r => accountFromRecord(r, currency))
  }

  private async getFreeCode() {
    // We look for the maximum code of type "CODE1234", so we can have other codes ("CODESpecial").
    // Code numbers can have any length but are zero-padded if they are less than 10K.
    const result = await this.db.$queryRaw`SELECT MAX(substring(code from 4)::int) FROM Account WHERE code ~ '${this.record.code}[0-9]+'` as {code: string}
    const codeNum = result ? parseInt(result.code) + 1 : 0
    const code = this.record.code + String(codeNum).padStart(4, "0")
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