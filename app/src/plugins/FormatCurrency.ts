import { Currency } from "src/store/model";
import { i18n } from "../boot/i18n";

export interface CurrencyFormat {
  /**
   * Whether to render all the decimals. Default to true.
   */
  decimals?: boolean;
  /**
   * Whether to apply the currency scale so the input value in an integer. Default to true.
   */
  scale?: boolean;
}

/**
 * Format the given amount as a currency.
 *
 * @param amount The integer amount, unscaled.
 * @param currency The currency
 * @param options Format options.
 */
export default function (
  amount: number,
  currency: Currency,
  options?: CurrencyFormat
): string {
  const {n} = i18n.global
  // Decimals and scale are true if undefined.
  const decimals = options?.decimals ?? true;
  const scale = options?.scale ?? true;
  if (scale) {
    amount = amount / 10 ** currency.attributes.scale;
  }
  const amountString = decimals
    ? n(amount, {
      minimumFractionDigits: currency.attributes.decimals,
      maximumFractionDigits: currency.attributes.decimals,
    })
    : n(amount);

  // Use vue-i18n $n to localize the number and append the currency symbol.
  return `${amountString} ${currency.attributes.symbol}`;
}
