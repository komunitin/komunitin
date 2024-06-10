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
  
  settings: AccountSettings
}

export type AccountSettings = {
  // Same id as the account
  id?: string

  // Payments from all accounts are automatically accepted
  acceptPaymentsAutomatically?: boolean

  // If acceptPaymentsAutomatically is false, this is a list of account id's
  // for which payments are automatically accepted.
  acceptPaymentsWhitelist?: string[]

  // If acceptPaymentsAutomatically is false, accept payments after this
  // period of time in seconds if no manual action is taken.
  acceptPaymentsAfter?: number

  // If present, the credit limit for this account is increased every
  // time this account receives a payment by the same amount until the
  // limit is reached.
  onPaymentCreditLimit?: number
}

// No input needed for creating an account (beyond implicit currency)!
export type InputAccount = Pick<Account, "id" | "code" | "creditLimit" | "maximumBalance" | "settings" | "users">
export type UpdateAccount = AtLeast<InputAccount, "id">

export function accountToRecord(account: UpdateAccount): Prisma.AccountUpdateInput {
  return {
    id: account.id,
    code: account.code,
    creditLimit: account.creditLimit,
    maximumBalance: account.maximumBalance ?? null,
    settings: account.settings,
  }
}

export const recordToAccount = (record: AccountRecord & {users?: UserRecord[]}, currency: Currency): Account => {
  const users = record.users ? record.users.map(user => ({id: user.id})) : undefined;
  return {
    id: record.id,
    status: record.status as AccountStatus,
    code: record.code,
    key: record.keyId,
    // Ledger cache
    balance: record.balance,
    creditLimit: record.creditLimit,
    maximumBalance: record.maximumBalance ?? undefined,
    // Created and updated
    created: record.created,
    updated: record.updated,
    // Relationships
    users,
    currency,
    settings: record.settings as AccountSettings,
  }
}

export const userHasAccount = (user: User, account: Account): boolean | undefined => {
  return account.users?.some(u => u.id === user.id)
}