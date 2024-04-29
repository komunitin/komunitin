import { Keypair, Keypair as StellarKeyPair } from "@stellar/stellar-sdk"
/*
 * Architecture:
 *  - Objects never have private keys as properties. Private keys are passed as
 *    arguments to methods when needed. This way we assure we keep the private 
 *    keys in memory as little as possible.
 *  - This interfaces are not meant to have any implementation besides the Stellar
 *    network. They are only defined for better code encapsulation. So you may
 *    find some Stellar specifics, althought they have been kept to the minimum.
 *  - This module does not handle persistence of any type. It is up to the caller
 *    to save the necessary data to recreate the objects, including the private
 *    keys.
 */

/**
 * Private and public key pair for an account.
 */
export type KeyPair = StellarKeyPair

/**
 * Configurable parameters for a Currency.
 * 
 * Note that currencies have always a fixed precision of 7 decimal places.
 */
export type LedgerCurrencyConfig = {
  /** 
   * The 4 letter currency code.
   * */ 
  code: string,
  /**
   * The rate of the currency in HOURs, as a fraction with numerator and denominator.
   * If the rate is 1/10, it means that 1 HOUR is worth 10 units of the currency.
   */
  rate: Rate
  /**
   * The maximum positive balance an account can have in this currency by default.
   * Defaults to infinity (accounts can have unlimited positive balance).
   */
  defaultMaximumBalance?: string
  /**
   * The initial funding an account will receive when created.
   * Defaults to 0 (so accounts are not funded on creation).
   */
  defaultInitialBalance?: string
}

/**
 * The keys needed to manage a currency.
 */
export type LedgerCurrencyKeys = {
  issuer: KeyPair, 
  credit: KeyPair, 
  admin: KeyPair
}

/**
 * The public data generated when a currency is created.
 */
export type LedgerCurrencyData = {
  issuerPublicKey: string,
  creditPublicKey: string,
  adminPublicKey: string
}

/**
 * The starting interface for the ledger.
 */
export interface Ledger {
  createCurrency(config: LedgerCurrencyConfig, sponsor: KeyPair): Promise<{currency: LedgerCurrency, keys: LedgerCurrencyKeys}>
  getCurrency(config: LedgerCurrencyConfig, data: LedgerCurrencyData): LedgerCurrency
}

/**
 * A Currency in a ledger.
 */
export interface LedgerCurrency {
  /**
   * Create and approve a new account in this currency.
   */
  createAccount(keys: {
    sponsor: Keypair
    issuer: Keypair,
    credit?: Keypair, // Only if defaultInitialBalance > 0
  }): Promise<{key: KeyPair}>

  getAccount(publicKey: string): Promise<LedgerAccount>
  
}

/**
 * An account in a ledger.
 */
export interface LedgerAccount {
  
  /**
   * 
   * @param payee 
   * @param amount 
   * @param meta 
   */
  pay(payment: {payeePublicKey: string,amount: string}, keys: {account: KeyPair, sponsor: KeyPair}): Promise<LedgerTransfer>

  /**
   * Permanently delete the account from the Stellar ledger.
   * @param keys 
   */
  delete(keys: {admin: KeyPair, sponsor: KeyPair}): Promise<void>

  /**
   * Get the balance of the account in the community currency.
   */
  balance(): string

  /**
   * Update the account data from the ledger.
   * 
   * Call this method after performing a transaction to get the updated balance.
   */
  update(): Promise<this>

}

/**
 * A transfer committed in the ledger.
 */
export interface LedgerTransfer {
  hash: string
}
/**
 * A fraction with numerator and denominator.
 */
export type Rate = {
  n: number
  d: number
}