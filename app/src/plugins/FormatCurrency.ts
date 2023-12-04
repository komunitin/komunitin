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
export default function formatCurrency(
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

  // Append or prepend the currency symbol depending on the locale.
  const sampleCurrency = n(1, {style: 'currency', currency: 'USD'})
  return sampleCurrency.startsWith('1') 
    ? `${amountString}${currency.attributes.symbol}` 
    : `${currency.attributes.symbol}${amountString}`
}

/**
 * Formats price as a currency only if it is numeric.
 */
export function formatPrice(price: string, currency: Currency, options?: CurrencyFormat): string {
  const actualOptions = {
    decimals: true,
    scale: false,
    ...options
  }
  const numeric = Number(price)
  if (!isNaN(numeric)) {
    return formatCurrency(numeric, currency, actualOptions)
  } else {
    return price
  }
}