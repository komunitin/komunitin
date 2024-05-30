import { LedgerCurrency, LedgerCurrencyState } from "../ledger";
import { CurrencyController } from ".";
import { TenantPrismaClient } from "./multitenant";
import { Keypair } from "@stellar/stellar-sdk";
import { decrypt, encrypt } from "../utils/crypto";
import type { KeyObject } from "node:crypto"
import { badRequest, forbidden, notFound, notImplemented } from "../utils/error";
import { CollectionOptions } from "../server/request";
import { includeRelations, whereFilter } from "./query";
import { Currency, UpdateCurrency, currencyToRecord, recordToCurrency, Account, 
  InputAccount, UpdateAccount, recordToAccount, InputTransfer, Transfer, 
  TransferState, UpdateTransfer, User, recordToTransfer, 
  AccountSettings} from "../model";
import { Context } from "../utils/context";
import { AtLeast, WithRequired } from "../utils/types";
import Big from "big.js";

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

export function amountToLedger(currency: AtLeast<Currency, "scale">, amount: number) {
  return Big(amount).div(Big(10).pow(currency.scale)).toString()
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

  /**
   * Check that the current user has an account in this currency.
   * @param ctx 
   * @returns the user object
   */
  private async checkUser(ctx: Context): Promise<User> {
    // TODO: cache user object
    const record = await this.db.user.findUnique({where: {id: ctx.userId}})
    if (!record) {
      throw forbidden(`User not found in currency ${this.model.code}`)
    }
    return {id: record.id}
  }

  private isAdmin(user:User) {
    return user.id === this.model.admin?.id
  }

  /**
   * Check that the current user is the currency owner.
   * @param ctx 
   * @returns the user object
   */
  private async checkAdmin(ctx: Context): Promise<User> {
    const user = await this.checkUser(ctx)
    if (!this.isAdmin(user)) {
      throw forbidden("Only the currency owner can perform this operation")
    }
    return user
  }

  async update(ctx: Context, currency: UpdateCurrency) {
    await this.checkAdmin(ctx)

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
  async createAccount(ctx: Context, account: InputAccount): Promise<Account> {
    // Only the currency owner can create accounts (by now).
    const admin = await this.checkAdmin(ctx)
    // Account owner: provided in input or current user.
    const userIds = account.users?.map(u => u.id) ?? [admin.id]

    // Find next free account code.
    const code = await this.getFreeCode()
    // get required keys from DB.
    const keys = {
      issuer: await this.retrieveKey(this.model.keys?.issuer as string),
      credit: this.model.defaultCreditLimit > 0 ? await this.creditKey() : undefined,
      sponsor: await this.sponsorKey()
    }
    // Create account in ledger with default credit limit & max balance.
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
        key: { connect: { id: keyId } },
        users: {
          connectOrCreate: userIds.map(id => ({where: {id}, create: {id}}))
        }
      },
    })
    return recordToAccount(record, this.model)
  }

  async updateAccount(ctx: Context, data: UpdateAccount): Promise<Account> {
    // Only the currency owner can update accounts.
    await this.checkAdmin(ctx)

    const account = await this.getAccount(ctx, data.id)
    // code, creditLimit and maximumBalance can be updated
    if (data.code && data.code !== account.code) {
      const existing = await this.getAccountByCode(ctx, data.code)
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
      await ledgerAccount.updateCredit(this.amountToLedger(data.creditLimit), {
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
  async getAccount(ctx: Context, id: string): Promise<WithRequired<Account, "users">> {
    await this.checkUser(ctx)

    const record = await this.db.account.findUnique({
      where: { 
        id,
        status: "active",
      },
      include: { users: true }
    })
    if (!record) {
      throw notFound(`Account id ${id} not found in currency ${this.model.code}`)
    }
    return recordToAccount(record, this.model) as WithRequired<Account, "users">
  }

  /**
   * Implements {@link CurrencyController.getAccountByCode}
   */
  async getAccountByCode(ctx: Context, code: string): Promise<Account|undefined> {
    await this.checkUser(ctx)
    const record = await this.db.account.findUnique({
      where: { 
        code,
        status: "active",
      },
      include: { users: true }
    })
    if (!record) {
      return undefined
    }
    return recordToAccount(record, this.model)
  }

  async getAccounts(ctx: Context, params: CollectionOptions): Promise<Account[]> {
    await this.checkUser(ctx)
    // Allow filtering by code and by id.
    const filter = whereFilter(params.filters)
    
    const records = await this.db.account.findMany({
      where: {
        currencyId: this.model.id,
        status: "active",
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

  async deleteAccount(ctx: Context, id: string): Promise<void> {
    const user = await this.checkUser(ctx)
    const account = await this.getAccount(ctx, id)
    if (!(this.isAdmin(user) || account.users.some(u => u.id === user.id))) {
      throw forbidden("User is not allowed to delete this account")
    }
    const ledgerAccount = await this.ledger.getAccount(account.key)
    if (account.balance != 0) {
      throw badRequest("Account balance must be zero to delete account")
    }
    // Delete account in ledger
    await ledgerAccount.delete({
      sponsor: await this.sponsorKey(),
      admin: await this.adminKey()
    })
    // Soft delete account in DB
    await this.db.account.update({
      data: { status: "deleted" },
      where: { id }
    })
  }

  /**
   * Implements CurrencyController.createTransfer()
   */
  async createTransfer(ctx: Context, data: InputTransfer): Promise<Transfer> {
    const user = await this.checkUser(ctx)
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
    if (!data.payer) {
      throw badRequest("Payer account id is required")
    }
    if (!data.payee) {
      throw badRequest("Payee account id is required")
    }
    if (data.payer == data.payee) {
      throw badRequest("Payer and payee must be different")
    }
    // Already throw if not found.
    const payer = await this.getAccount(ctx, data.payer)
    const payee = await this.getAccount(ctx, data.payee)

    // Check that the user is allowed to transfer from the payer account.
    if (!(this.isAdmin(user) || payer.users.some(u => u.id === user.id))) {
      throw forbidden("User is not allowed to transfer from this account")
    }

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
        payee: { connect: { id: payee.id } },
        user: { connect: { id: user.id } }
      }
    })
    let transfer = recordToTransfer(record, {payer,payee})
    
    if (data.state === "committed") {
      transfer = await this.setTransferState(transfer, "committed", user)
    }

    return transfer
  }

  /**
   * Moves the transfer to the specified state. This function does not check authorisation.
   * @returns 
   */
  private async setTransferState(transfer: Transfer, state: TransferState, user: User) {
    // "new" | "accepted" => "committed" | "failed"
    if (state == "committed" && ["new", "accepted"].includes(transfer.state)) {
      transfer.state = "submitted"
      try {
        const transaction = await this.submitTransfer(transfer, this.isAdmin(user))
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

  private async submitTransfer(transfer: Transfer, admin = false) {
    const ledgerPayer = await this.ledger.getAccount(transfer.payer.key)
    const transaction = await ledgerPayer.pay({
      payeePublicKey: transfer.payee.key,
      amount: this.amountToLedger(transfer.amount),
    }, {
      sponsor: await this.sponsorKey(),
      account: await (admin ? this.adminKey() : this.retrieveKey(transfer.payer.key))
    })
    
    await this.updateAccountBalance(transfer.payer)
    await this.updateAccountBalance(transfer.payee)
  
    return transaction
  }

  private async updateAccountBalance(account: Account): Promise<void> {
    const ledgerAccount = await this.ledger.getAccount(account.key)
    account.balance = this.amountFromLedger(ledgerAccount.balance())
      - account.creditLimit
    await this.db.account.update({
      data: { balance: account.balance },
      where: { id: account.id }
    })
  }

  private amountToLedger(amount: number) {
    return amountToLedger(this.model, amount)
  }

  private amountFromLedger(amount: string) {
    return Big(amount).times(Big(10).pow(this.model.scale)).toNumber()
  }

  /**
   * Implements {@link CurrencyController.getAccountSettings}
   */
  public async getAccountSettings(ctx: Context, id: string): Promise<AccountSettings> {
    const user = await this.checkUser(ctx)
    const account = await this.getAccount(ctx, id)
    if (!this.isAdmin(user) && !account.users.some(u => u.id === user.id)) {
      throw forbidden("User is not allowed to access this account settings")
    }
    return {
      id: account.id,
      ...account.settings
    }
  }

  public async updateAccountSettings(ctx: Context, settings: AccountSettings ): Promise<AccountSettings> {
    const user = await this.checkUser(ctx)
    const account = await this.getAccount(ctx, settings.id as string)
    if (!this.isAdmin(user) && !account.users.some(u => u.id === user.id)) {
      throw forbidden("User is not allowed to update this account settings")
    }
    const record = await this.db.account.update({
      data: { ...settings },
      where: { id: account.id }
    })
    const updated = recordToAccount(record, this.model)
    return {
      id: updated.id,
      ...updated.settings
    }
  }

  private async getFreeCode() {
    // We look for the maximum code of type "CODE1234", so we can have other codes ("CODESpecial").
    // Code numbers can have any length but are zero-padded until 4 digits.
    const pattern = `${this.model.code}[0-9]+`
    const [{max}] = await this.db.$queryRaw`SELECT MAX(substring(code from 5)::int) as max FROM "Account" WHERE code ~ ${pattern}` as [{max: number|null}]
    const codeNum = (max !== null) ? max + 1 : 0
    const code = this.model.code + String(codeNum).padStart(4, "0")
    return code
  }

  /**
   * Implements {@link CurrencyController.getTransfer}
   */
  public async getTransfer(ctx: Context, id: string): Promise<Transfer> {
    const user = await this.checkUser(ctx)
    const transfer = await this.db.transfer.findUnique({
      where: {id},
      include: {
        payer: {
          include: {
            users: true
          }
        },
        payee: {
          include: {
            users: true
          }
        }
      }
    })
    if (!transfer) {
      throw notFound(`Transfer with id ${id} not found`)
    }
    // Transfers can be accessed by admin and by involved parties.
    if (!this.isAdmin(user) && ![transfer.payer, transfer.payee].some(a => a.users.some(u => u.id === user.id))) {
      throw forbidden("User is not allowed to access this transfer")
    }
    
    return recordToTransfer(transfer, {
      payer: recordToAccount(transfer.payer, this.model),
      payee: recordToAccount(transfer.payee, this.model)
    })
  }

  public async getTransfers(ctx: Context, params: CollectionOptions): Promise<Transfer[]> {
    const user = await this.checkUser(ctx)

    const where = whereFilter(params.filters)
    
    // Regular users can only transfers where they are involved.
    if (!this.isAdmin(user)) {
      where.OR = [
        {payer: {users: {some: {id: user.id}}}},
        {payee: {users: {some: {id: user.id}}}}
      ]
    }

    const include = includeRelations(params.include)

    const records = await this.db.transfer.findMany({
      where,
      orderBy: {
        [params.sort.field]: params.sort.order
      },
      include: {
        ...include,
        // always include accounts.
        payer: true,
        payee: true
      },
      skip: params.pagination.cursor,
      take: params.pagination.size,
    }) 

    return records.map(r => recordToTransfer(r, {
      payer: recordToAccount(r.payer, this.model),
      payee: recordToAccount(r.payee, this.model)
    }))
  }
    

  /**
   * Implements {@link CurrencyController.updateTransfer}
   */
  public async updateTransfer(ctx: Context, data: UpdateTransfer): Promise<Transfer> {
    const user = await this.checkUser(ctx)
    let transfer = await this.getTransfer(ctx, data.id)

    // Update transfer attributes, if still not submitted.
    if (transfer.state === "new") {
      // New transfers can be updated by its creator.
      if (transfer.user.id !== user.id) {
        throw forbidden("User is not allowed to update this transfer")
      }
      if (data.amount !== undefined && data.amount <= 0) {
        throw badRequest("Transfer amount must be positive")
      }
      if (data.payer !== undefined && data.payer !== transfer.payer.id) {
        // Only admin can change transfer payer.
        if (user.id !== this.model.admin?.id) {
          throw forbidden("User is not allowed to change payer")
        }
        // Throw if not found
        transfer.payer = await this.getAccount(ctx, data.payer)
      }
      if (data.payee !== undefined && data.payee !== transfer.payee.id) {
        transfer.payee = await this.getAccount(ctx, data.payee)
      }
      const record = await this.db.transfer.update({
        data: {
          amount: data.amount,
          meta: data.meta,
          payer: { connect: { id: transfer.payer.id } },
          payee: { connect: { id: transfer.payee.id } }
        },
        where: {id: transfer.id},
      })
      transfer = recordToTransfer(record, {payer: transfer.payer, payee: transfer.payee})
    }

    // Update state
    if (data.state !== undefined && data.state !== transfer.state) {
      // Transfer commit.
      if (transfer.state == "new" && data.state == "committed") {
        if (user.id !== transfer.user.id) {
          throw forbidden("User is not allowed to commit this transfer")
        }
        transfer = await this.setTransferState(transfer, data.state, user)
      } else {
        throw badRequest(`Invalid state transition from ${transfer.state} to ${data.state}`)
      }
    }

    return transfer
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