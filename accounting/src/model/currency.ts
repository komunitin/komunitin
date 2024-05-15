
import { Rate } from "../utils/types";
import { Currency as CurrencyRecord, Prisma } from "@prisma/client"


export { CurrencyRecord }

// Currency model
export interface Currency {
  id: string
  code: string
  status: "new" | "active"
    
  name: string
  namePlural: string
    
  symbol: string
  decimals: number
  scale: number
  rate: Rate

  defaultCreditLimit: number
  defaultMaximumBalance?: number

  keys?: {
    issuer: string,
    credit: string,
    admin: string,
    externalTrader: string,
    externalIssuer: string
  }

  encryptionKey: string

  created: Date
  updated: Date
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
    defaultCreditLimit: currency.defaultCreditLimit,
    defaultMaximumBalance: currency.defaultMaximumBalance ?? null
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
    defaultCreditLimit: record.defaultCreditLimit,
    defaultMaximumBalance: record.defaultMaximumBalance ?? undefined,
    keys: record.issuerKeyId ? {
      issuer: record.issuerKeyId as string,
      credit: record.creditKeyId as string,
      admin: record.adminKeyId as string,
      externalTrader: record.externalTraderKeyId as string,
      externalIssuer: record.externalIssuerKeyId as string
    } : undefined,
    encryptionKey: record.encryptionKeyId,
    created: record.created,
    updated: record.updated,
  }
}