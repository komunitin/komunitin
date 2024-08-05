import {Notify} from "quasar"

export const notifyTransactionState = (state: string, t: (m: string) => string) => {
  switch(state) {
    case "committed":
      Notify.create({type: "positive", message: t("transactionCommitted")});
      break;
    case "pending":
      Notify.create({type: "info", message: t("transactionPending")});
      break;
    case "rejected":
      Notify.create({type: "negative", message: t("transactionRejected")});
      break;
  }
}

export const notifyTransactionStateMultiple = (states: Record<string, number>, t: (m: string, args?: Record<string, number>) => string) => {
  if ("committed" in states) {
    Notify.create({
      type: "positive", 
      message: t("transactionsCommitted", {num: states.committed})
    })
  }
  if ("pending" in states) {
    Notify.create({
      type: "info", 
      message: t("transactionsPending", {num: states.pending})
    })
  }
  if ("rejected" in states) {
    Notify.create({
      type: "negative", 
      message: t("transactionsRejected", {num: states.pending})
    })
  }
}