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
