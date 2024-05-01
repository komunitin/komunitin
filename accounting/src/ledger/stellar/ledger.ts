import { Networks, Horizon, Keypair, TransactionBuilder, BASE_FEE, Transaction, Memo, MemoType, Operation, NetworkError, FeeBumpTransaction } from "@stellar/stellar-sdk"
import { sleep } from "../../utils/sleep"
import { Ledger, LedgerCurrencyConfig, LedgerCurrency, LedgerCurrencyKeys, LedgerCurrencyData } from "../ledger"
import { StellarAccount } from "./account"
import { StellarCurrency } from "./currency"
import Big from "big.js"
import { logger } from "../../utils/logger"

export type StellarLedgerConfig = {
  server: string,
  network: Networks,
  sponsorPublicKey: string,
  domain: string
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
    this.server = new Horizon.Server(config.server)
    this.network = config.network
    this.sponsorPublicKey = Keypair.fromPublicKey(config.sponsorPublicKey)
    this.domain = config.domain
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
        throw new Error("TODO: Implement fee strategy!", {cause: error})
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
    if (error.response && error.response.status == 400 || error.response.status == 404 || error.response.status == 429) {
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
        this.logTransactionError(transaction, error)
        throw error
      }
      
      await sleep(timeout)

      // Check that the transaction is not expired before sending it again.
      const inner = transaction instanceof FeeBumpTransaction ? transaction.innerTransaction : transaction
      const expiration = parseInt(inner.timeBounds?.maxTime ?? "0")

      if (Date.now() >= expiration * 1000) {
        throw new Error("Transaction expired. Create a new one and submit it again.", {cause: error})
      }

      return await this.submitTransactionWithRetry(transaction, 2 * timeout)
    }
  }
  /**
   * Implements {@link Ledger.createCurrency}
   */
  async createCurrency(config: LedgerCurrencyConfig, sponsor: Keypair): Promise<{currency: LedgerCurrency, keys: LedgerCurrencyKeys}> {
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

    const currency = this.getCurrency(config, data)
    
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
      credit: Big(config.externalTraderInitialBalance ?? 0).gt(0) ? keys.credit : undefined,
    })

    logger.info({publicKeys: data}, `Created new currency ${config.code}`)

    return {currency, keys}
  }
  /**
   * Implements {@link Ledger.getCurrency}
   */
  getCurrency(config: LedgerCurrencyConfig, data: LedgerCurrencyData): StellarCurrency {
    // TODO: if we end up using the accounts, this will need to be a singleton for each different currency.
    return new StellarCurrency(this, config, data)
  }

  private logTransactionError(transaction: Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction, error: unknown) {
    const inner = transaction instanceof FeeBumpTransaction ? transaction.innerTransaction : transaction
    const operations = inner.operations.map(op => op.type)
    if (error && (error as any).response?.data?.title) {
      const nerror = error as NetworkError
      const msg = `Horizon Error: ${nerror.response.data?.title}`
      const data = nerror.response.data as Horizon.HorizonApi.ErrorResponseData.TransactionFailed
      if (data.extras) {
        // Transaction failed
        const result = data.extras.result_codes
        logger.error({operations, results: result.operations, result: result.transaction}, msg)
      } else {
        // Other Horizon error
        logger.error({operations, data}, msg)
      }
    } else if (error instanceof Error) {
      logger.error({operations, error}, `Error submitting transaction: ${error.message}`)
    } else {
      logger.error({operations, error}, `Error submitting transaction: ${error}`)
    }
  }
}