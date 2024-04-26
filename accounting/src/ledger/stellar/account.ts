import { Horizon, Keypair, Operation } from "@stellar/stellar-sdk"
import { KeyPair, LedgerAccount } from "../ledger"
import { StellarCurrency } from "./currency"

export class StellarAccount implements LedgerAccount {
  public currency: StellarCurrency
  public account: Horizon.AccountResponse

  constructor(account: Horizon.AccountResponse, currency: StellarCurrency) {
    this.currency = currency
    this.account = account
  }

  /**
   * Get the balance of the account in the local currency.
   * @returns The balance of the account in the local currency.
   */
  balance() {
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
   * Delete this account from the Stellar network. That means:
   *   - Send all its balance to the credit account
   *   - Remove its trustline
   *   - Should we merge it to the sponsor account?
   * The admin key is required because this is a high threshold operation.
   */
  async delete(keys: {
    admin: KeyPair,
    sponsor: KeyPair
  }) {
    const builder = this.currency.ledger.transactionBuilder(this)
    // Send all the balance to the credit account.
    if (BigInt(this.balance()) > 0n) {
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
  }

  /**
   * Perform a community currency transfer.
   * @param payment The payment details: destination and amount
   * @param keys The signer keys. The account entry can be either the master key or the admin key for administered accounts.
   */
  async pay(payment: { payeePublicKey: string; amount: string }, keys: { account: Keypair; sponsor: Keypair }) {
    if (BigInt(this.balance()) < BigInt(payment.amount)) {
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

}
