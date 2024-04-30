import { Asset, Horizon, Keypair, Operation } from "@stellar/stellar-sdk"
import { KeyPair, LedgerAccount, PathQuote } from "../ledger"
import { StellarCurrency } from "./currency"
import {Big} from "big.js"

export class StellarAccount implements LedgerAccount {
  public currency: StellarCurrency

  // Use getStellarAccount() instead.
  private account: Horizon.AccountResponse | undefined

  constructor(account: Horizon.AccountResponse, currency: StellarCurrency) {
    this.currency = currency
    this.account = account
  }

  async update() {
    if (this.account === undefined) {
      throw new Error("Account not found")
    }
    this.account = await this.currency.ledger.server.loadAccount(this.account.accountId())
    return this
  }

  /**
   * Get the balance of the account in the local currency.
   * @returns The balance of the account in the local currency.
   */
  balance() {
    if (this.account === undefined) {
      throw new Error("Account not found")
    }
    const balance = this.account.balances.find((b) => {
      if (b.asset_type == "credit_alphanum4" || b.asset_type == "credit_alphanum12") {
        const balance = b as Horizon.HorizonApi.BalanceLineAsset
        return (balance.asset_issuer == this.currency.data.issuerPublicKey && balance.asset_code == this.currency.config.code) 
      }
      return false
    })
    if (!balance) {
      throw new Error("Unexpected account without local currency balance!")
    }
    return balance.balance
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
    this.account = undefined
  }

  /**
   * Implements {@link LedgerAccount.pay}
   */
  async pay(payment: { payeePublicKey: string; amount: string }, keys: { account: Keypair; sponsor: Keypair }) {
    if (Big(this.balance()).lt(payment.amount)) {
      throw new Error("Insufficient balance")
    }
    const builder = this.currency.ledger.transactionBuilder(this)
    builder.addOperation(Operation.payment({
      destination: payment.payeePublicKey,
      asset: this.currency.asset(),
      amount: payment.amount
    }))
    return await this.currency.ledger.submitTransaction(builder, [keys.account], keys.sponsor)
  }

  /**
   * Get the Stellar account object.
   * @returns The Stellar account object.
   */
  getStellarAccount() {
    if (this.account === undefined) {
      throw new Error("Account not found")
    }
    return this.account
  }

  /**
   * Implements {@link LedgerAccount.externalPay}
   */
  async externalPay(payment: { payeePublicKey: string, amount: string, path: PathQuote }, keys: { account: Keypair; sponsor: Keypair }) {

    if (Big(this.balance()).lt(payment.path.sourceAmount)) {
      throw new Error("Insufficient balance")
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

    return await this.currency.ledger.submitTransaction(builder, [keys.account], keys.sponsor)

  }
    



}
