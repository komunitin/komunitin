/*
import { Transaction, Operation } from "@stellar/stellar-sdk";
import { LedgerPayment, LedgerTransaction } from "../ledger";
export class StellarTransaction implements LedgerTransaction {
  private transaction: Transaction
  
  constructor(transaction: Transaction) {
    this.transaction = transaction
  }

  get hash() {
    return this.transaction.hash().toString("hex")
  }
  get payments() {
    return this.transaction.operations
      .filter(o => ["payment", "pathPaymentStrictReceive", "pathPaymentStrictSend"].includes(o.type))
      .map(o => {
        if (o.type == "payment") {
          return {
            payer: o.source ?? this.transaction.source,
            payee: o.destination,
            amount: o.amount,
            asset: o.asset
          }
        } else if (o.type == "pathPaymentStrictReceive") {
          return {
            payer: o.source ?? this.transaction.source,
            payee: o.destination,
            amount: o.destAmount,
            asset: o.destAsset
          }
        } else {
          o = o as Operation.PathPaymentStrictSend
          return {
            payer: o.source ?? this.transaction.source,
            payee: o.destination,
            amount: o.sendAmount,
            asset: o.sendAsset
          }
        }
      })
  }
}
*/