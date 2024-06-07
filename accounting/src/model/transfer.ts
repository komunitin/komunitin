import { AtLeast } from "src/utils/types"
import { Account } from "./account"
import { Transfer as TransferRecord } from "@prisma/client"
import { User } from "."

/**
 * Possible state transitions for a transfer.
 * 
 * new ?-> pending | submitted
 * pending ?-> accepted | rejected
 * rejected ?-> deleted
 * submitted -> committed | failed
 * failed ?-> deleted
 */
export const TransferStates = ["new", "pending", "rejected", "submitted", "failed", "committed", "deleted"] as const

export type TransferState = typeof TransferStates[number]

export interface Transfer {
  id: string

  state: TransferState
  amount: number
  meta: string

  hash?: string

  created: Date
  updated: Date
  
  payer: Account
  payee: Account

  user: User
}

export type InputTransfer = AtLeast<Omit<Transfer, "created" | "updated" | "payer" | "payee">, "amount" | "meta" | "state"> & {payer: string, payee: string}
export type UpdateTransfer = AtLeast<Omit<Transfer, "created" | "updated" | "payer" | "payee"> & {payer: string, payee: string}, "id">

export const recordToTransfer = (record: TransferRecord, accounts: {payer: Account, payee: Account}): Transfer => ({
  id: record.id,
  state: record.state as TransferState,
  amount: record.amount,
  meta: record.meta,
  hash: record.hash ?? undefined,
  created: record.created,
  updated: record.updated,
  payer: accounts.payer,
  payee: accounts.payee,
  user: {id: record.userId}
})