import { Asset, Operation, AuthRequiredFlag, AuthRevocableFlag, AuthClawbackEnabledFlag, AuthFlag, TransactionBuilder, Keypair, Horizon } from "@stellar/stellar-sdk"
import { LedgerCurrency, LedgerCurrencyConfig, LedgerCurrencyData, PathQuote } from "../ledger"
import { StellarAccount } from "./account"
import { StellarLedger } from "./ledger"
import Big from "big.js"
import { logger } from "src/utils/logger"
import { retry } from "src/utils/sleep"

export class StellarCurrency implements LedgerCurrency {
  static GLOBAL_ASSET_CODE = "HOUR"
  /**
   * In case there is no defined maximum balance for the external trader account,
   * this is the default for the initial balance in hours for this account.
   */
  static DEFAULT_EXTERNAL_TRADER_INITIAL_BALANCE = "1000"

  ledger: StellarLedger
  config: LedgerCurrencyConfig & {defaultInitialBalance: string}
  data: LedgerCurrencyData

  // Registry of currency accounts. This way we are sure we are not instantiating
  // the same account twice and hence we won't have seq number issues.
  private accounts: Record<string, Promise<StellarAccount>>

  // Registry of Horizon stream connection closers.
  private streams: (() => void)[]

  constructor(ledger: StellarLedger, config: LedgerCurrencyConfig, data: LedgerCurrencyData) {
    this.ledger = ledger
    const defaultConfig = {
      defaultInitialBalance: "0",
      defaultMaximumBalance: undefined
    }
    this.config = {...defaultConfig, ...config}
    this.data = data
    this.accounts = {}
    this.streams = []

    // Input checking.
    if (this.config.code.match(/^[A-Z0-9]{4}$/) === null) {
      throw new Error("Invalid currency code")
    }
  }
  
  public start() {
    const stream = this.ledger.server.trades()
      .forAccount(this.data.externalTraderPublicKey)
      .cursor('now')
      .stream({
      // The arrow notation is used to preserve the context of the class.
      onmessage: (page) => {
        logger.debug({page}, `Received horizon external trade event for currency ${this.config.code}`)
        // Looks like the typings are not correct and message is a TradeRecord intstead of a CollectionPage<TradeRecord>
        const record = page as unknown as Horizon.ServerApi.TradeRecord
        if (record.trade_type) {
          this.handleExternalTradeEvent(record)
          .catch((error) => {
            this.ledger.emitter.emit("error", error)
          })
        } else {
          throw new Error("Unexpected trade message", {cause: page})
        }
      },
      onerror: (error) => {
        this.ledger.emitter.emit("error", error)
      }
    })
    this.streams.push(stream)
  }

  public stop() {
    // Close all horizon stream connections.
    for (const close of this.streams) {
      close()
    }
  }

  private async handleExternalTradeEvent(trade: Horizon.ServerApi.TradeRecord) {
    // We want to monitor incomming payments using this external trader.
    // An incoming payment is Hx => Ht => Lt, where:
    // - Hx is the external Hour
    // - Ht is the local Hour
    // - Lt is the local currency
    
    // We want to catch the Hx => Ht (selling local hours by external hours)
    // trade if it is done by this external trader.
    if (trade.base_asset_type == "native" || trade.counter_asset_type == "native") {
      throw new Error("Unexpected trade with native token", {
        cause: trade
      })
    }
    const base = new Asset(trade.base_asset_code as string, trade.base_asset_issuer)
    const counter = new Asset(trade.counter_asset_code as string, trade.counter_asset_issuer)
    const hour = this.hour()
    const asset = this.asset()

    if (trade.base_is_seller // Selling
      && base.equals(hour) // this HOUR
      && counter.code == StellarCurrency.GLOBAL_ASSET_CODE // by external HOUR
    ) {
      // Create a market order that will either immediately execute to compensate 
      // the trade balance or will be appended to the order book to be executed in
      // a later outgoing external payment.
      this.ledger.emitter.emit("incommingHourTrade", this, {
        externalHour: counter
      })
    } else if (!trade.base_is_seller // Buying
      && base.code == StellarCurrency.GLOBAL_ASSET_CODE // external HOUR
      && counter.equals(hour)) { // by this HOUR
      this.ledger.emitter.emit("incommingHourTrade", this, {
        externalHour: base
      })
    } else if (base.equals(asset) && counter.equals(hour)) {
      if (trade.base_is_seller) {
        // selling local by hours, so this is an incomming payment.
        this.ledger.emitter.emit("incommingTrade", this)
      } else {
        this.ledger.emitter.emit("outgoingTrade", this)
      }
    } else if (base.equals(hour) && counter.equals(asset)) {
      if (trade.base_is_seller) {
        // selling hours by local, so this is an outgoing payment.
        this.ledger.emitter.emit("outgoingTrade", this)
      } else {
        this.ledger.emitter.emit("incommingTrade", this)
      }
    } else {
      throw new Error("Unexpected trade", {
        cause: trade
      })
    }
  }

  /**
   * Get an offer from the trader account selling the given asset and buying hours.
   */
  private async fetchExternalSellingOffer(asset: Asset) {
    const offers = await this.ledger.server.offers()
    .seller(this.data.externalTraderPublicKey)
    .selling(asset)
    .buying(this.hour())
    .limit(1).call()

    if (offers.records.length > 0) {
      return offers.records[0]
    } else {
      return false
    }
  }
/*
  async updateExternalTraderOffers(keys: {sponsor: Keypair, externalTrader: Keypair}) {
    const trader = await this.externalTraderAccount()
    // All balances for trader account
    const balances = trader.balances()
    // All sell offers for trader account
    const offers = await this.ledger.server.offers().forAccount(this.data.externalTraderPublicKey).call()
    const findOfferSelling = (asset: Asset) => offers.records.find((o) => o.selling.asset_issuer == asset.issuer && o.selling.asset_code == asset.code)
    for (const balance of balances) {
      if (balance.asset.equals(this.asset()) && Big(balance.balance).gt(0)) {
        // Update outgoingTradeOffer.
        const offer = findOfferSelling(this.asset())
        if (offer?.amount != balance.balance) {

        }
      } else if (balance.asset.code == StellarCurrency.GLOBAL_ASSET_CODE && Big(balance.balance).gt(0)) {
        // Update incomingTradeOffer.

      }
    }
  }
*/

  /**
   * This function checks the offer from the external trader account that is selling the given asset
   * and updates this offer so the total offered equals the current balance.
   */
  async updateExternalOffer(asset: Asset, keys: {sponsor: Keypair, externalTrader: Keypair})  {
    const offer = await this.fetchExternalSellingOffer(asset)
    const trader = await this.externalTraderAccount()
    const balance = trader.balance(asset)

    const builder = this.ledger.transactionBuilder(trader)
    const sellOfferOptions = {
      selling: asset,
      buying: this.hour(),
      amount: balance.toString(),
      price: "1"
    }

    if (offer) {
      // Offer already exists, just update it.
      builder.addOperation(Operation.manageSellOffer({
        ...sellOfferOptions,
        offerId: offer.id
      }))
      await this.ledger.submitTransaction(builder, [keys.externalTrader], keys.sponsor)
      logger.info({asset}, `Updated external ${asset.code} offer for currency ${this.config.code}`)
    } else {
      // Create new offer.
      builder.addOperation(Operation.beginSponsoringFutureReserves({
        source: keys.sponsor.publicKey(),
        sponsoredId: this.data.externalTraderPublicKey
      }))
      .addOperation(Operation.createPassiveSellOffer(sellOfferOptions))
      .addOperation(Operation.endSponsoringFutureReserves({
        source: this.data.externalTraderPublicKey
      }))

      await this.ledger.submitTransaction(builder, [keys.sponsor, keys.externalTrader], keys.sponsor)
      logger.info({asset}, `Created external ${asset.code} offer for currency ${this.config.code}`)
    }
    this.ledger.emitter.emit("externalOfferUpdated", this, {...sellOfferOptions, created: !offer})
  }

  /**
   * Get the Stellar asset object for this currency.
   * @returns The asset.
   */
  asset(): Asset {
    return new Asset(this.config.code, this.data.issuerPublicKey)
  }

  /**
   * Get the Stellar asset object for the global "HOUR" asset.
   * @returns The asset.
   */
  hour(): Asset {
    return new Asset(StellarCurrency.GLOBAL_ASSET_CODE, this.data.externalIssuerPublicKey)
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

  async externalTraderAccount() {
    return this.getAccount(this.data.externalTraderPublicKey)
  }

  async externalIssuerAccount() {
    return this.getAccount(this.data.externalIssuerPublicKey)
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
    // 2.1 Initially fund credit account
    builder.addOperation(Operation.payment({
      source: this.data.issuerPublicKey,
      destination: this.data.creditPublicKey,
      asset: this.asset(),
      amount: this.creditAccountStartingBalance()
    }))

    // 3. Admin account
    this.createAccountTransaction(builder, {
      publicKey: this.data.adminPublicKey,
      initialBalance: "0",
      maximumBalance: undefined
    })

    await this.ledger.submitTransaction(builder, [keys.sponsor, keys.issuer, keys.credit, keys.admin], keys.sponsor)
    
  }

  /**
   * Creates the necessary accounts and trustlines for the currency to be able to exchange with 
   * other komunitin currencies in the Stellar network.
   * 
   * Give the credit key only if this.config.externalTraderInitialBalance is not zero.
   * @param keys 
   */
  async installGateway(keys: {
    sponsor: Keypair
    issuer: Keypair,
    externalIssuer: Keypair,
    externalTrader: Keypair,
    credit?: Keypair,
  }) {
    const issuerAccount = await this.issuerAccount()
    const builder = this.ledger.transactionBuilder(issuerAccount)
    // 1. Create external issuer.
    // Not using the createAccountTransaction because this account does not have local currency.
    .addOperation(Operation.beginSponsoringFutureReserves({
      source: keys.sponsor.publicKey(),
      sponsoredId: this.data.externalIssuerPublicKey
    }))
    // 1.1 Create account
    .addOperation(Operation.createAccount({
      destination: this.data.externalIssuerPublicKey,
      startingBalance: "0"
    }))
    // 1.2. Set homeDomain
    .addOperation(Operation.setOptions({
      source: this.data.externalIssuerPublicKey,
      homeDomain: this.ledger.domain,
    }))
    .addOperation(Operation.endSponsoringFutureReserves({
      source: this.data.externalIssuerPublicKey
    }))
    // 2.0 Create external trader with local currency balance.
    this.createAccountTransaction(builder, {
      publicKey: this.data.externalTraderPublicKey,
      initialBalance: this.config.externalTraderInitialBalance ?? "0",
      maximumBalance: this.config.externalTraderMaximumBalance
    })
    // Add additional properties to external trader.
    builder.addOperation(Operation.beginSponsoringFutureReserves({
      source: keys.sponsor.publicKey(),
      sponsoredId: this.data.externalTraderPublicKey
    }))
    // 2.1 Create unlimited trustline to hours.
    .addOperation(Operation.changeTrust({
      source: this.data.externalTraderPublicKey,
      asset: this.hour(),
    }))
    // 2.2 Add initial hours balance to external trader.
    const hoursBalance = this.externalTraderStartingHoursBalance()
    if (Big(hoursBalance).gt(0)) {
      builder.addOperation(Operation.payment({
        source: this.data.externalIssuerPublicKey,
        destination: this.data.externalTraderPublicKey,
        asset: this.hour(),
        amount: hoursBalance
      }))
    }
    // 2.3 Add passive sell offer for incomming payments (hour => asset).
    if (this.config.externalTraderInitialBalance && Big(this.config.externalTraderInitialBalance).gt(0)) {
      builder.addOperation(Operation.createPassiveSellOffer({
        source: this.data.externalTraderPublicKey,
        selling: this.asset(),
        buying: this.hour(),
        amount: this.config.externalTraderInitialBalance,
        price: this.config.rate
      }))
    }
    // 2.4 Add passive sell offer for outgoing payments (asset => hour).
    if (Big(hoursBalance).gt(0)) {
      builder.addOperation(Operation.createPassiveSellOffer({
        source: this.data.externalTraderPublicKey,
        selling: this.hour(),
        buying: this.asset(),
        amount: hoursBalance,
        price: {n: this.config.rate.d, d: this.config.rate.n}
      }))
    }
    builder.addOperation(Operation.endSponsoringFutureReserves({
      source: this.data.externalTraderPublicKey
    }))

    const signers = [keys.sponsor, keys.issuer, keys.externalIssuer, keys.externalTrader]
    if (keys.credit) {
      signers.push(keys.credit)
    }
    return await this.ledger.submitTransaction(builder, signers, keys.sponsor)
  }

  /**
   * Ensures that the external trader account has sufficient hours, and transfers more from
   * the external issuer if needed.
   * 
   * This function assures that the current balance of the external trader is not less than
   * the starting balance. This starting balance is computed as follows:
   *  - If externalTraderMaximumBalance is defined, it is the difference between this value and
   *   the externalTraderInitialBalance expressed in hours. Since hours are needed in exchange
   *   for local currency.
   * - If externalTraderMaximumBalance is not defined, the starting balance is just the 
   *   constant {@link StellarCurrency.DEFAULT_EXTERNAL_TRADER_INITIAL_BALANCE}.
   */
  public async fundExternalTrader(keys: {
    sponsor: Keypair,
    externalIssuer: Keypair,
  }) {
    
    const starting = this.externalTraderStartingHoursBalance()

    const trader = await this.externalTraderAccount()
    const balance = Big(trader.balance())
    
    if (balance.lt(starting)) {
      const amount = Big(starting).minus(balance).toString()
      const external = await this.externalIssuerAccount()
      const builder = this.ledger.transactionBuilder(external)
        .addOperation(Operation.payment({
          destination: this.data.externalTraderPublicKey,
          asset: this.hour(),
          amount
        }))
      return await this.ledger.submitTransaction(builder, [keys.externalIssuer], keys.sponsor)
    }
    return false
  }

  private externalTraderStartingHoursBalance(): string {
    // TODO: take in count trusted currencies.
    if (this.config.externalTraderMaximumBalance) {
      return this.fromLocalToHour(
        Big(this.config.externalTraderMaximumBalance)
        .minus(this.config.externalTraderInitialBalance ?? 0)
        .toString())
    } else {
      return StellarCurrency.DEFAULT_EXTERNAL_TRADER_INITIAL_BALANCE
    }
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
  }) {
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
      return await this.ledger.submitTransaction(builder, [keys.issuer], keys.sponsor)
    }
    return false
  }

  // Return the balance that the credit account should have so it can continue its operation for 
  // some time. Before we need to fund it again.
  // At this time this is computed as the quantity to fund 100 new accounts plus the equivalent
  // in local currency of 100 HOURs.
  private creditAccountStartingBalance(): string {
    const nAccounts = 100
    const defaultCredits = Big(this.config.defaultInitialBalance ?? 0).times(nAccounts) 
    const baseHours = 100
    const base = this.fromHourToLocal(baseHours.toString())
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
   * Implements {@link LedgerCurrency.createAccount()}
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

    logger.info({publicKey: account.publicKey()}, `Created new account for currency ${this.config.code}`)

    return {key: account}
  }
  /**
   * Implements {@link LedgerCurrency.getAccount()}
   */
  async getAccount(publicKey: string, update = true): Promise<StellarAccount> {
    if (!this.accounts[publicKey]) {
      this.accounts[publicKey] = this.ledger.server.loadAccount(publicKey).then((account) => {
        return new StellarAccount(account, this)
      })
      return await this.accounts[publicKey]
    } else {
      const account = await this.accounts[publicKey]
      if (update) {
        await account.update()
      }
      return account
    }
  }

  /**
   * Convert an amount in local currency to hours with 7 digits of precision.
   * @param amountInLocal The amount in local currency.
   * @returns The amount in hours.
   */
  fromLocalToHour(amountInLocal: string): string {
    return Big(amountInLocal).times(this.config.rate.n).div(this.config.rate.d).toFixed(7)
  }

  /**
   * Convert an amount in hours to local currency truncating to 7 digits of precision.
   * @param amountInHours The amount in hours.
   * @returns The amount in local currency.
   */
  fromHourToLocal(amountInHours: string): string {
    return Big(amountInHours).times(this.config.rate.d).div(this.config.rate.n).toFixed(7, Big.roundDown)
  }

  /**
   * Implements {@link LedgerCurrency.trustCurrency()}.
   */
  async trustCurrency(line: { trustedPublicKey: string, limit: string }, keys: { sponsor: Keypair, externalTrader: Keypair, externalIssuer: Keypair }) {
    const asset = new Asset(StellarCurrency.GLOBAL_ASSET_CODE, line.trustedPublicKey)
    const limit = this.fromLocalToHour(line.limit)
    
    const externalTrader = await this.externalTraderAccount()
    const builder = this.ledger.transactionBuilder(externalTrader)
    builder.addOperation(Operation.beginSponsoringFutureReserves({
      source: keys.sponsor.publicKey(),
      sponsoredId: this.data.externalTraderPublicKey
    }))
    // We need to fund the trading account to satisfy the selling liabilities.
    .addOperation(Operation.payment({
      source: this.data.externalIssuerPublicKey,
      destination: this.data.externalTraderPublicKey,
      asset: this.hour(),
      amount: limit
    }))
    .addOperation(Operation.changeTrust({asset,limit}))
    // Sell own HOUR's by external HOUR's at 1:1 rate for path payments
    .addOperation(Operation.createPassiveSellOffer({
      selling: this.hour(),
      buying: asset,
      amount: limit,
      price: "1"
    }))
    .addOperation(Operation.endSponsoringFutureReserves({
      source: this.data.externalTraderPublicKey
    }))

    await this.ledger.submitTransaction(builder, [keys.sponsor, keys.externalTrader, keys.externalIssuer], keys.sponsor)

    logger.info({line}, `Currency ${this.config.code} trusted external issuer`)
  }

  /**
   * Implements {@link LedgerCurrency.quotePath}, adding additional asset properties to the result.
   */
  async quotePath(data: {destCode: string, destIssuer: string, amount: string, retry?: boolean}): Promise<false | PathQuote>{
    const destAsset = new Asset(data.destCode, data.destIssuer)
    const noPathFound = new Error("No viable path found")
    const fn = async () => {
      const paths = await this.ledger.server.strictReceivePaths(
        [this.asset()],
        destAsset,
        data.amount
      ).call()

      // Filter out paths that are not sneding the required amount.
      const viable = paths.records.filter((p) => Big(p.destination_amount).gte(data.amount))

      if (viable.length > 0) {
        // Get the path with minimum source amount.
        const path = viable.reduce((acc, p) => (Big(p.source_amount).lt(acc.source_amount)) ? p : acc)
        return {
          sourceAmount: path.source_amount,
          sourceAsset: this.asset(),
          destAmount: path.destination_amount,
          destAsset,
          path: path.path.map((a) => new Asset(a.asset_code, a.asset_issuer))
        }
      } else {
        throw noPathFound
      }
    }

    try {
      if (data.retry) {
        return await retry(fn, 30000, 1000)
      } else {
        return await fn()
      }
    } catch (error) {
      if (error === noPathFound) {
        return false
      } else {
        throw error
      }
    }
  }

}
