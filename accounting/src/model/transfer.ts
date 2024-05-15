import { AtLeast } from "src/utils/types"
import { Account } from "./account"

/**
 * Possible state transitions for a transfer.
 * 
 * new ?-> pending | sent
 * pending ?-> accepted | rejected
 * accepted -> sent
 * rejected ?-> deleted
 * sent -> committed | failed
 * failed ?-> deleted
 */
export const TransferStates = ["new", "pending", "accepted", "rejected", "submitted", "failed", "committed", "deleted"] as const

export type TransferState = typeof TransferStates[number]

export interface Transfer {
  id: string
  amount: number
  
  meta: string

  state: TransferState

  created: Date
  updated: Date
  
  payer: Account
  payee: Account
}

export type InputTransfer = AtLeast<Omit<Transfer, "created" | "updated" | "payer" | "payee">, "amount" | "meta" | "state"> & {payerId: string, payeeId: string}