
import { LedgerCurrencyState } from "../ledger";
import { Rate } from "../utils/types";
import { Currency as CurrencyRecord, Prisma } from "@prisma/client"
import { User } from "./user";


export { CurrencyRecord }

export type CurrencySettings = {
  /**
   * The credit limit that will have new qccounts by default.
   */
  defaultInitialCreditLimit: number
  /**
   * The maximum balance that will have new accounts by default. Set
   * to undefined for no limit.
   */
  defaultInitialMaximumBalance?: number
  /**
   * Users need to accept payments by default (false) or they are charged automatically (true)
   */
  defaultAcceptPaymentsAutomatically?: boolean
  /**
   * List of payee account id's that can get payments without manual acceptance
   */
  defaultAcceptPaymentsWhitelist?: string[]
  /**
   * Number of seconds after which payments are accepted automatically
   */
  defaultAcceptPaymentsAfter?: number
  /**
   * If set, the dynamic on-payment credit limit scheme will be activated. Then, the
   * value of this field is the hard credit limit.
   */
  defaultOnPaymentCreditLimit?: number
  /**
   * Users can perform payments by default.
   */
  defaultallowPayments?: boolean
  /**
   * Users can request payments by default.
   */
  defaultallowPaymentRequests?: boolean
}

export type CurrencyStatus = "new" | "active"

/**
 * Currency model
 */
export interface Currency {
  id: string
  code: string
  status: CurrencyStatus
    
  name: string
  namePlural: string
    
  symbol: string
  decimals: number
  scale: number
  rate: Rate

  encryptionKey: string

  keys?: {
    issuer: string,
    credit: string,
    admin: string,
    externalTrader: string,
    externalIssuer: string
  }

  settings: CurrencySettings
  state: LedgerCurrencyState

  created: Date
  updated: Date

  admin?: User
}

export type CreateCurrency = Omit<Currency, "id" | "status" | "created" | "updated" | "encryptionKey" | "keys">
export type UpdateCurrency = Partial<CreateCurrency & {id: string}>

export function currencyToRecord(currency: CreateCurrency): Prisma.CurrencyCreateInput
export function currencyToRecord(currency: UpdateCurrency): Prisma.CurrencyUpdateInput
export function currencyToRecord(currency: CreateCurrency | UpdateCurrency): Prisma.CurrencyCreateInput | Prisma.CurrencyUpdateInput {
  return {
    id: (currency as UpdateCurrency).id,
    code: currency.code,

    name: currency.name,
    namePlural: currency.namePlural,
    symbol: currency.symbol,
    decimals: currency.decimals,
    scale: currency.scale,
    rateN: currency.rate?.n,
    rateD: currency.rate?.d,

    settings: currency.settings,
    state: currency.state,
  }
}

export const recordToCurrency = (record: CurrencyRecord): Currency => {
  return {
    id: record.id,
    code: record.code,
    status: record.status as Currency["status"],

    name: record.name,
    namePlural: record.namePlural,
    symbol: record.symbol,
    decimals: record.decimals,
    scale: record.scale,
    rate: { n: record.rateN, d: record.rateD },
    
    encryptionKey: record.encryptionKeyId,
    keys: record.issuerKeyId ? {
      issuer: record.issuerKeyId as string,
      credit: record.creditKeyId as string,
      admin: record.adminKeyId as string,
      externalTrader: record.externalTraderKeyId as string,
      externalIssuer: record.externalIssuerKeyId as string
    } : undefined,
    
    settings: record.settings as CurrencySettings,
    state: record.state as LedgerCurrencyState,
    
    created: record.created,
    updated: record.updated,

    admin: {
      id: record.adminId
    }
  }
}