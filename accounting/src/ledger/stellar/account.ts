import { Asset, Horizon, Keypair, Operation } from "@stellar/stellar-sdk"
import { KeyPair, LedgerAccount, LedgerTransfer, PathQuote } from "../ledger"
import { StellarCurrency } from "./currency"
import {Big} from "big.js"
import { logger } from "../../utils/logger"
import { badTransaction, internalError } from "../../utils/error"
import { StellarTransaction } from "./transaction"

export class StellarAccount implements LedgerAccount {
  public currency: StellarCurrency

  // Use getStellarAccount() instead.
  private account: Horizon.AccountResponse | undefined

  constructor(account: Horizon.AccountResponse, currency: StellarCurrency) {
    this.currency = currency
    this.account = account
  }

  private stellarAccount() {
    if (this.account === undefined) {
      throw internalError("Account not found")
    }
    return this.account
  }

  async update() {
    this.account = await this.currency.ledger.server.loadAccount(this.stellarAccount().accountId())
    return this
  }
  
  /**
   * Implements LedgerAccount.transfers()
   */
  async transfers(): Promise<LedgerTransfer[]> {
    const transfers = [] as LedgerTransfer[]
    let result = await this.stellarAccount().payments({
      limit: 20
    })
    do {
      transfers.push(...result.records.map((r) => ({
        amount: r.amount,
        asset: new Asset(r.asset_code as string, r.asset_issuer),
        payer: r.from,
        payee: r.to
      })))
      result = await result.next()
    } while(result.records.length > 0);

    return transfers;
  }

  /**
   * Implements LedgerAccount.credit()
   * 
   * Note that this call requires fetching and parsing all payments to this account.
   */
  async credit(): Promise<string> {
    const transfers = await this.transfers()
    return transfers.filter(t => t.payer == this.currency.data.creditPublicKey)
      .reduce((amount, transfer) => Big(transfer.amount).add(amount), Big(0))
      .toString()
  }

  maximumBalance() : string {
    const asset = this.currency.asset()
    const balance = this.stellarBalance(asset)
    if (!balance) {
      throw internalError(`Unexpected account without ${asset.code} currency balance`)
    }
    return balance.limit
  }

  private stellarBalance(asset: Asset) {
    if (this.account === undefined) {
      throw internalError("Account not found")
    }
    
    const balance = this.account.balances.find((b) => {
      if (b.asset_type == asset.getAssetType()) {
        const balance = b as Horizon.HorizonApi.BalanceLineAsset
        return (balance.asset_issuer == asset.issuer && balance.asset_code == asset.code) 
      }
      return false
    })
    return balance as Horizon.HorizonApi.BalanceLineAsset | undefined
  }
  /**
   * Implements { @link LedgerAccount.balance }
   */
  balance(asset?: Asset) {
    if (asset === undefined) {
      asset = this.currency.asset()
    }
    const balance = this.stellarBalance(asset)
    if (!balance) {
      throw internalError(`Unexpected account without ${asset.code} currency balance`)
    }
    return balance.balance
  }

  balances() {
    if (this.account === undefined) {
      throw internalError("Account not found")
    }
    return (this.account.balances as Horizon.HorizonApi.BalanceLineAsset[])
      .map(b => ({asset: new Asset(b.asset_code, b.asset_issuer), balance: b.balance, limit: b.limit}))
  }

  /**
   * Implements {@link LedgerAccount.delete }
   */
  async delete(keys: {
    admin: KeyPair,
    sponsor: KeyPair
  }) {
    const builder = this.currency.ledger.transactionBuilder(this)
    // Send all the balance to the credit account.
    if (Big(this.balance()).gt(0)) {
      builder.addOperation(Operation.payment({
        destination: this.currency.data.creditPublicKey,
        asset: this.currency.asset(),
        amount: this.balance()
      }))
    }
    // Remove the trustline.
    builder.addOperation(Operation.changeTrust({
      asset: this.currency.asset(),
      limit: "0"
    }))
    // Delete the account.
    builder.addOperation(Operation.accountMerge({
      destination: this.currency.ledger.sponsorPublicKey.publicKey()
    }))
    await this.currency.ledger.submitTransaction(builder, [keys.admin], keys.sponsor)
    
    logger.info(`Account ${this.account?.accountId()} deleted`)

    this.account = undefined
  }

  /**
   * Implements {@link LedgerAccount.pay}
   */
  async pay(payment: { payeePublicKey: string; amount: string }, keys: { account: Keypair; sponsor: Keypair }) {
    if (Big(this.balance()).lt(payment.amount)) {
      throw badTransaction("Insufficient balance")
    }
    const builder = this.currency.ledger.transactionBuilder(this)
    builder.addOperation(Operation.payment({
      destination: payment.payeePublicKey,
      asset: this.currency.asset(),
      amount: payment.amount
    }))
    const transaction = await this.currency.ledger.submitTransaction(builder, [keys.account], keys.sponsor)
    
    logger.info({hash: transaction.hash}, `Account ${this.account?.accountId()} paid ${payment.amount} to ${payment.payeePublicKey}`)

    return transaction
    
  }

  /**
   * Get the Stellar account object.
   * @returns The Stellar account object.
   */
  getStellarAccount() {
    if (this.account === undefined) {
      throw internalError("Account not found")
    }
    return this.account
  }

  /**
   * Implements {@link LedgerAccount.externalPay}
   */
  async externalPay(payment: { payeePublicKey: string, amount: string, path: PathQuote }, keys: { account: Keypair; sponsor: Keypair }) {

    if (Big(this.balance()).lt(payment.path.sourceAmount)) {
      throw badTransaction("Insufficient balance")
    }

    const builder = this.currency.ledger.transactionBuilder(this)

    builder.addOperation(Operation.pathPaymentStrictReceive({
      sendAsset: payment.path.sourceAsset as Asset,
      sendMax: payment.path.sourceAmount,
      destination: payment.payeePublicKey,
      destAsset: payment.path.destAsset as Asset,
      destAmount: payment.amount,
      path: payment.path.path as Asset[]
    }))

    const transaction = await this.currency.ledger.submitTransaction(builder, [keys.account], keys.sponsor)
    logger.info({hash: transaction.hash}, `Account ${this.account?.accountId()} paid ${payment.amount} ${payment.path.destAsset.code} to ${payment.payeePublicKey} through path`)
    
    return transaction
  }
    



}
