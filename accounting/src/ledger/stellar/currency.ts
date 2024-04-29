import { Asset, Operation, AuthRequiredFlag, AuthRevocableFlag, AuthClawbackEnabledFlag, AuthFlag, TransactionBuilder, Keypair } from "@stellar/stellar-sdk"
import { LedgerAccount, LedgerCurrency, LedgerCurrencyConfig, LedgerCurrencyData } from "../ledger"
import { StellarAccount } from "./account"
import { StellarLedger } from "./ledger"
import Big from "big.js"

export class StellarCurrency implements LedgerCurrency {
  ledger: StellarLedger
  config: LedgerCurrencyConfig & {defaultInitialBalance: string}
  data: LedgerCurrencyData

  // Registry of currency accounts. This way we are sure we are not instantiating
  // the same account twice and hence we won't have seq number issues.
  private accounts: Record<string, Promise<StellarAccount>>

  constructor(ledger: StellarLedger, config: LedgerCurrencyConfig, data: LedgerCurrencyData) {
    this.ledger = ledger
    const defaultConfig = {
      defaultInitialBalance: "0",
      defaultMaximumBalance: undefined
    }
    this.config = {...defaultConfig, ...config}
    this.data = data
    this.accounts = {}

    // Input checking.
    if (this.config.code.match(/^[A-Z0-9]{4}$/) === null) {
      throw new Error("Invalid currency code")
    }
  }

  /**
   * Get the Stellar asset object for this currency.
   * @returns The asset.
   */
  asset() : Asset {
    return new Asset(this.config.code, this.data.issuerPublicKey)
  }

  /**
   * Load the issuer account
   * @returns The issuer account for this currency.
   */
  async issuerAccount() {
    return this.getAccount(this.data.issuerPublicKey)
  }

  /**
   * Load the credit account
   * @returns The credit account for this currency.
   */
  async creditAccount() {
    return this.getAccount(this.data.creditPublicKey)
  }

  /**
   * Create the necessary accounts and trustlines for the currency in the Stellar network.
   * Only the local model is created.
   * @param keys 
   */
  async install(keys: {
    sponsor: Keypair
    issuer: Keypair,
    credit: Keypair,
    admin: Keypair
  }): Promise<void> {
    
    const builder = await this.ledger.sponsorTransactionBuilder()
    builder
      // 1. Issuer.
      .addOperation(Operation.beginSponsoringFutureReserves({
        sponsoredId: this.data.issuerPublicKey
      }))
      // 1.1 Create account
      .addOperation(Operation.createAccount({
        destination: this.data.issuerPublicKey,
        startingBalance: "0"
      }))
      // 1.2. Set flags to control the asset:
      //   - AuthRequiredFlag: Trustlines from user accounts to this asset need to be explicitly authorized by the issuer.
      //   - AuthRevocableFlag: Trustlines can be revoked by the issuer, thus freezing the asset in user account.
      //   - AuthClawbackEnabledFlag: Issuer can remove a portion or all the asset from a user account.
      .addOperation(Operation.setOptions({
        source: this.data.issuerPublicKey,
        setFlags: (AuthRequiredFlag | AuthRevocableFlag | AuthClawbackEnabledFlag) as AuthFlag,
        homeDomain: this.ledger.domain
      }))
      .addOperation(Operation.endSponsoringFutureReserves({
        source: this.data.issuerPublicKey
      }))
      
    // 2. Credit account.
    this.createAccountTransaction(builder, {
      publicKey: this.data.creditPublicKey,
      initialBalance: "0",
      maximumBalance: undefined
    })

    // 3. Admin account
    this.createAccountTransaction(builder, {
      publicKey: this.data.adminPublicKey,
      initialBalance: "0",
      maximumBalance: undefined
    })

    await this.ledger.submitTransaction(builder, [keys.sponsor, keys.issuer, keys.credit, keys.admin], keys.sponsor)
    
  }

  /**
   * Ensures that the credit account has sufficient funds, and transfers more from 
   * the issuer if needed.
   * 
   * @param keys 
   */
  public async fundCreditAccount(keys: {
    sponsor: Keypair
    issuer: Keypair,
  }): Promise<void> {
    const creditAccount = await this.creditAccount()
    const balance = Big(creditAccount.balance())
    const starting = Big(this.creditAccountStartingBalance())
    if (balance.lt(starting)) {
      const diff = starting.minus(balance)
      const issuerAccount = await this.issuerAccount()
      const builder = this.ledger.transactionBuilder(issuerAccount)
        .addOperation(Operation.payment({
          destination: this.data.creditPublicKey,
          asset: this.asset(),
          amount: diff.toString()
        }))
      await this.ledger.submitTransaction(builder, [keys.issuer], keys.sponsor)
    }
  }

  // Return the balance that the credit account should have so it can continue its operation for 
  // some time. Before we need to fund it again.
  // At this time this is computed as the quantity to fund 100 new accounts plus the equivalent
  // in local currency of 100 HOURs.
  private creditAccountStartingBalance(): string {
    const nAccounts = 100
    const defaultCredits = Big(this.config.defaultInitialBalance ?? 0).times(nAccounts) 
    const baseHours = 100
    const base = Big(this.config.rate.d).times(baseHours).div(this.config.rate.n).toFixed(7)
    return (defaultCredits + base).toString()
  }

  /**
   * Adds the necessary operations to t to create a new account with a trustline to this local currency 
   * with limit config.maximumBalance and optionally an initial payment of config.initialBalance from 
   * the credit account. Note that this transaction will need to be signed by the sponsor, the new account,
   * the issuer and optionally the credit account if config.initialBalance > 0.
   * 
   * @param t The transaction builder.
   * @param config Account parameters.
   */
  private createAccountTransaction(t: TransactionBuilder, config: {publicKey: string, initialBalance: string, maximumBalance?: string, adminSigner?: string}) {
    const sponsorPublicKey = this.ledger.sponsorPublicKey.publicKey()
    const asset = this.asset()

    t.addOperation(Operation.beginSponsoringFutureReserves({
      source: sponsorPublicKey,
      sponsoredId: config.publicKey
    }))
      // Create account
      .addOperation(Operation.createAccount({
        destination: config.publicKey,
        startingBalance: "0"
      }))
      // Create trust line
      .addOperation(Operation.changeTrust({
        source: config.publicKey,
        asset,
        limit: config.maximumBalance
      }))
      // Aprove trust line
      .addOperation(Operation.setTrustLineFlags({
        source: this.data.issuerPublicKey,
        asset,
        trustor: config.publicKey,
        flags: {
          authorized: true,
        }
      }))
    // Add the admin as a signer, and set the account thresholds so that both the account key
    // and the admin key can sign payments, but only the admin can perform administrative 
    // operations such as change the signers or delete the account.
    if (config.adminSigner) {
      t.addOperation(Operation.setOptions({
        source: config.publicKey,
        signer: {
          ed25519PublicKey: config.adminSigner,
          weight: 2
        }
      }))
      .addOperation(Operation.setOptions({
        source: config.publicKey,
        masterWeight: 1,
        lowThreshold: 1,
        medThreshold: 1,
        highThreshold: 2
      }))
    }

    t.addOperation(Operation.endSponsoringFutureReserves({
      source: config.publicKey
    }))

    // Add initial funding.
    if (Big(config.initialBalance).gt(0)) {
      t.addOperation(Operation.payment({
        source: this.data.creditPublicKey,
        destination: config.publicKey,
        asset,
        amount: config.initialBalance
      }))
    }
    
  }
  /**
   * Creates and authorizes a user account for the currency.
   */
  async createAccount(keys: {
    sponsor: Keypair
    issuer: Keypair,
    credit?: Keypair, // Only if defaultInitialBalance > 0
  }): Promise<{key: Keypair}> {
    if (keys.credit && Big(this.config.defaultInitialBalance).eq(0)) {
      throw new Error("Credit key not allowed if defaultInitialBalance is 0.")
    }
    if (!keys.credit && Big(this.config.defaultInitialBalance).gt(0)) {
      throw new Error("Credit key required if defaultInitialBalance is positive.")
    }
    // Create keypair.
    const account = Keypair.random()
    const issuerAccount = await this.issuerAccount()
    const builder = this.ledger.transactionBuilder(issuerAccount)

    this.createAccountTransaction(builder, {
      publicKey: account.publicKey(),
      initialBalance: this.config.defaultInitialBalance,
      maximumBalance: this.config.defaultMaximumBalance,
      adminSigner: this.data.adminPublicKey
    })

    await this.ledger.submitTransaction(builder, [...Object.values(keys), account], keys.sponsor)

    return {key: account}
  }

  async getAccount(publicKey: string): Promise<StellarAccount> {
    if (!this.accounts[publicKey]) {
      this.accounts[publicKey] = this.ledger.server.loadAccount(publicKey).then((account) => {
        return new StellarAccount(account, this)
      })      
    }
    return await this.accounts[publicKey]
  }

}