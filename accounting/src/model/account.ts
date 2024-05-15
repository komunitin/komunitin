import { AtLeast } from 'src/utils/types'
import { Currency } from './currency'
import { Account as AccountRecord, Prisma } from '@prisma/client'

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
export type UpdateAccount = AtLeast<Pick<Account, "id" | "code" | "creditLimit" | "maximumBalance">, "id">

export function accountToRecord(account: UpdateAccount): Prisma.AccountUpdateInput {
  return {
    id: account.id,
    code: account.code,
    creditLimit: account.creditLimit,
    maximumBalance: account.maximumBalance ?? null,
  }
}

export const recordToAccount = (record: AccountRecord, currency: Currency): Account => {
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