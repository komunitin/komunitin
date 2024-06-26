import { Networks, Horizon, Keypair, TransactionBuilder, BASE_FEE, Transaction, Memo, MemoType, Operation, NetworkError, FeeBumpTransaction } from "@stellar/stellar-sdk"
import { sleep } from "../../utils/sleep"
import { Ledger, LedgerCurrencyConfig, LedgerCurrencyKeys, LedgerCurrencyData, LedgerEvents, LedgerCurrencyState } from "../ledger"
import { StellarAccount } from "./account"
import { StellarCurrency } from "./currency"
import Big from "big.js"
import { logger } from "../../utils/logger"
import TypedEmitter from "typed-emitter"
import {EventEmitter} from "node:events"
import { KError, badTransaction, internalError, notImplemented } from "../../utils/error"

export type StellarLedgerConfig = {
  server: string,
  network: "testnet" | "local" | "public",
  sponsorPublicKey: string,
  domain: string
}

export const createStellarLedger = (config: StellarLedgerConfig): Ledger => {
  return new StellarLedger(config)
}

/**
 * This is a singleton class. It is used to manage the connection to the Stellar network.
 */
export class StellarLedger implements Ledger {
  
  public server: Horizon.Server
  private network: Networks
  public sponsorPublicKey: Keypair
  public domain: string

  public static STELLAR_TIMEOUT_SECONDS = 30

  public emitter: TypedEmitter<LedgerEvents>

  // issuer public key => currency
  private currencies: Record<string, StellarCurrency> = {}

  /**
   * Create a new instance of the StellarLedger class. Note that a single instance should be used for a sponsor account
   * and set of currencies. So in practice, this class must be used as a singleton.
   * 
   * @param server The URL of the Horizon server to connect to. For example, "https://horizon-testnet.stellar.org"
   * @param network The Stellar Network Passphase to use. For example Networks.TESTNET
   * @param sponsor The Keypair of the sponsor account. This account must be funded with XLM. No two instances of this
   * class (in the same or different processes) should use the same sponsor account. Otherwise, there will be conflicts
   * with the sequence numbers.
   */
  constructor(config: StellarLedgerConfig) {
    const networks = {
      testnet: Networks.TESTNET,
      local: Networks.STANDALONE,
      public: Networks.PUBLIC
    }
    this.server = new Horizon.Server(config.server)
    this.network = networks[config.network]
    this.sponsorPublicKey = Keypair.fromPublicKey(config.sponsorPublicKey)
    this.domain = config.domain
    this.emitter = new EventEmitter() as TypedEmitter<LedgerEvents>
    
    // Always log errors in event handlers.
    this.addListener("error", (error: any) => {
      logger.error(error)
    })
  }

  /**
   * Implements {@link Ledger.addListener}
   */
  public addListener(event: keyof LedgerEvents, handler: any) {
    return this.emitter.addListener(event, handler)
  }

  /**
   * Implements {@link Ledger.removeListener}
   */
  public removeListener(event: keyof LedgerEvents, listener: any) {
    return this.emitter.removeListener(event, listener)
  }

  /**
   * Implements {@link Ledger.stop}
   */
  public stop() {
    this.emitter.removeAllListeners()
    for (const currency of Object.values(this.currencies)) {
      currency.stop()
    }
    this.currencies = {}
  }

  private sponsorAccountPromise: Promise<Horizon.AccountResponse> | undefined
  async sponsorAccount(): Promise<Horizon.AccountResponse> {
    if (!this.sponsorAccountPromise) {
      this.sponsorAccountPromise = this.server.loadAccount(this.sponsorPublicKey.publicKey())
    }
    return await this.sponsorAccountPromise
  }
  /**
   * Return a TransactionBuilder with fee and network.
   * @param account The source account.
   * @returns 
   */
  transactionBuilder(account: StellarAccount) {
    return this.stellarTransactionBuilder(account.getStellarAccount())
  }
  async sponsorTransactionBuilder() {
    const sponsorAccount = await this.sponsorAccount()
    return this.stellarTransactionBuilder(sponsorAccount)
  }
  private baseFee() {
    return BASE_FEE
  }

  private stellarTransactionBuilder(account: Horizon.AccountResponse) {
    return new TransactionBuilder(account, {
      networkPassphrase: this.network,
      fee: this.baseFee()
    })
  }
  /**
   * Submit the transaction to the Stellar network.
   * @param transaction 
   * @param keys The set of keys required to sign the transaction.
   * @param sponsorKey The key of the sponsor account.
   * @returns 
   */
  async submitTransaction(builder: TransactionBuilder, keys: Keypair[], sponsorKey: Keypair) {
    try {
      const inner = builder.setTimeout(StellarLedger.STELLAR_TIMEOUT_SECONDS).build()
      inner.sign(...keys)
      
      // If the transaction is not sent by the sponsor account itself, we 
      // wrap it into a fee-bump transaction so the fee is always payed by the 
      // sponsor.
      let transaction: Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction

      if (inner.source !== sponsorKey.publicKey()) {
        transaction = TransactionBuilder.buildFeeBumpTransaction(sponsorKey, this.baseFee(), inner, this.network)
        transaction.sign(sponsorKey)
      } else {
        transaction = inner
      }
      
      return await this.submitTransactionWithRetry(transaction)
      
    } catch (error) {
      if (this.isFeeError(error)) {
        // TODO: Handle the insufficient fee error by waiting a reasonable amount of
        // time before increasing the fee up to a maximum value.
        // https://developers.stellar.org/docs/learn/encyclopedia/error-handling
        throw notImplemented("Implement fee strategy", error)
      }
      throw error
    }
  }

  private isFeeError(error: any): error is NetworkError {
    // The fee is insufficient for the transaction.
    return (error.response && error.response.data && error.response.data.extras 
      && error.response.data.extras.result_codes && 
      error.response.data.extras.result_codes.transaction == Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_FEE)
  }

  private isNonRetryError(error: any): boolean {
    // Bas request, not found, too many requests.
    if (error.response && (error.response.status == 400 || error.response.status == 404 || error.response.status == 429)) {
      return true
    }
    return false
  }

  /**
   * Submit a transaction with exponential backoff network retry, starting at 200 ms 
   * by default.
   * @param transaction 
   * @param timeout 
   * @returns 
   */
  private async submitTransactionWithRetry(transaction: Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction, timeout: number = 200): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      return await this.server.submitTransaction(transaction)
    } catch (error) {
      if (this.isNonRetryError(error)) {
        throw this.getTransactionError(transaction, error)
      }
      
      await sleep(timeout)

      // Check that the transaction is not expired before sending it again.
      const inner = transaction instanceof FeeBumpTransaction ? transaction.innerTransaction : transaction
      const expiration = parseInt(inner.timeBounds?.maxTime ?? "0")

      if (Date.now() >= expiration * 1000) {
        throw badTransaction("Transaction expired. Create a new one and submit it again.", error)
      }

      return await this.submitTransactionWithRetry(transaction, 2 * timeout)
    }
  }
  /**
   * Implements {@link Ledger.createCurrency}
   */
  async createCurrency(config: LedgerCurrencyConfig, sponsor: Keypair): Promise<LedgerCurrencyKeys> {
    // Generate the keys.
    const keys = {
      issuer: Keypair.random(),
      credit: Keypair.random(),
      admin: Keypair.random(),
      externalIssuer: Keypair.random(),
      externalTrader: Keypair.random()
    }

    const data = {
      issuerPublicKey: keys.issuer.publicKey(),
      creditPublicKey: keys.credit.publicKey(),
      adminPublicKey: keys.admin.publicKey(),
      externalIssuerPublicKey: keys.externalIssuer.publicKey(),
      externalTraderPublicKey: keys.externalTrader.publicKey()
    }

    const currency = new StellarCurrency(this, config, data)
    
    await currency.install({
      sponsor,
      admin: keys.admin,
      credit: keys.credit,
      issuer: keys.issuer
    })

    await currency.installGateway({
      sponsor,
      issuer: keys.issuer,
      externalIssuer: keys.externalIssuer,
      externalTrader: keys.externalTrader,
      credit: Big(config.externalTraderInitialCredit ?? 0).gt(0) ? keys.credit : undefined,
    })

    logger.info({publicKeys: data}, `Created new currency ${config.code}`)

    return keys
  }
  /**
   * Implements {@link Ledger.getCurrency}
   */
  getCurrency(config: LedgerCurrencyConfig, data: LedgerCurrencyData, state?: LedgerCurrencyState): StellarCurrency {
    if (!this.currencies[data.issuerPublicKey]) {
      this.currencies[data.issuerPublicKey] = new StellarCurrency(this, config, data, state)
      this.currencies[data.issuerPublicKey].start()
    }
    return this.currencies[data.issuerPublicKey]
  }

  private getTransactionError(transaction: Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction, error: unknown): KError {
    const inner = transaction instanceof FeeBumpTransaction ? transaction.innerTransaction : transaction
    const operations = inner.operations.map(op => op.type)
    if (error && (error as any).response?.data?.title) {
      const nerror = error as NetworkError
      const msg = `Horizon Error: ${nerror.response.data?.title}`
      const data = nerror.response.data as Horizon.HorizonApi.ErrorResponseData.TransactionFailed
      if (data.extras) {
        // Transaction failed
        const result = data.extras.result_codes
        return badTransaction(msg, {operations, results: result.operations, result: result.transaction})
      } else {
        // Other Horizon error
        return badTransaction(msg, {operations, data})
      }
    } else if (error instanceof Error) {
      return internalError(`Error submitting transaction: ${error.message}`, {operations, error})
    } else {
      return internalError(`Error submitting transaction: ${error}`, {operations, error})
    }
  }
}