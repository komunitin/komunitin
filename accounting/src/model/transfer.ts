import { AtLeast } from "src/utils/types"
import { Account } from "./account"
import { Transfer as TransferRecord } from "@prisma/client"
import { hash } from "@stellar/stellar-sdk"

/**
 * Possible state transitions for a transfer.
 * 
 * new ?-> pending | sent
 * pending ?-> accepted | rejected
 * accepted -> submitted
 * rejected ?-> deleted
 * submitted -> committed | failed
 * failed ?-> deleted
 */
export const TransferStates = ["new", "pending", "accepted", "rejected", "submitted", "failed", "committed", "deleted"] as const

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
}

export type InputTransfer = AtLeast<Omit<Transfer, "created" | "updated" | "payer" | "payee">, "amount" | "meta" | "state"> & {payerId: string, payeeId: string}

export const recordToTransfer = (record: TransferRecord, accounts: {payer: Account, payee: Account}): Transfer => ({
  id: record.id,
  state: record.state as TransferState,
  amount: record.amount,
  meta: record.meta,
  hash: record.hash ?? undefined,
  created: record.created,
  updated: record.updated,
  payer: accounts.payer,
  payee: accounts.payee
})