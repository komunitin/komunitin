import { Currency } from './currency'
import { Account as AccountRecord } from '@prisma/client'
import { Prisma } from '@prisma/client'

type CreateAccount = Prisma.AccountCreateInput

export interface Account {
  id: string,
  code: string,
  key: string

  created: Date
  updated: Date

  // These are calculated fields from the ledger.
  balance: number,
  creditLimit: number,
  maximumBalance?: number,

  currency: Currency
  // TODO UserSettings.
  settings: undefined
}

// No input needed for creating an account (beyond implicit currency)!
export type InputAccount = {}

export const accountFromRecord = (record: AccountRecord, currency: Currency): Account => {
  return {
    id: record.id,
    code: record.code,
    key: record.keyId,
    balance: record.balance,
    creditLimit: record.creditLimit,
    maximumBalance: record.maximumBalance ?? undefined,
    created: record.created,
    updated: record.updated,
    // Relationships
    currency,
    settings: undefined
  }
}