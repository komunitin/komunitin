import { AtLeast } from 'src/utils/types'
import { Currency } from './currency'
import { Account as AccountRecord, User as UserRecord, Prisma } from '@prisma/client'
import { User } from './user'

export enum AccountStatus {
  Active = "active",
  Deleted = "deleted",
}

export interface Account {
  id: string,
  code: string,
  key: string
  status: AccountStatus

  created: Date
  updated: Date

  // These are calculated fields from the ledger.
  balance: number,
  creditLimit: number,
  maximumBalance?: number,

  users?: User[]
  currency: Currency
  // TODO UserSettings.
  settings: undefined
}

// No input needed for creating an account (beyond implicit currency)!
export type InputAccount = Partial<Pick<Account, "users">>
export type UpdateAccount = AtLeast<Pick<Account, "id" | "code" | "creditLimit" | "maximumBalance">, "id">

export function accountToRecord(account: UpdateAccount): Prisma.AccountUpdateInput {
  return {
    id: account.id,
    code: account.code,
    creditLimit: account.creditLimit,
    maximumBalance: account.maximumBalance ?? null,
  }
}

export const recordToAccount = (record: AccountRecord & {users?: UserRecord[]}, currency: Currency): Account => {
  const users = record.users ? record.users.map(user => ({id: user.id})) : undefined;
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
    users,
    currency,
    settings: undefined
  }
}