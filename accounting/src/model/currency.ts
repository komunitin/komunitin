import { Rate } from "../utils/types";
import { Currency as CurrencyRecord } from "@prisma/client"

// API Models.

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

  created: Date
  updated: Date
}

export type InputCurrency = Omit<Currency, "id" | "status" | "created" | "updated">

export const currencyFromRecord = (record: CurrencyRecord) => {
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
    created: record.created,
    updated: record.updated
  }
}