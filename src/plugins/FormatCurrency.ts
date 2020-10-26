import _Vue from 'vue';
import { Currency } from 'src/store/model';
import { NumberFormatOptions } from 'vue-i18n';

export interface CurrencyFormat {
  /**
   * Whether to render all the decimals. Default to true.
   */
  decimals?: boolean
  /**
   * Whether to apply the currency scale so the input value in an integer. Default to true.
   */
  scale?: boolean
}

export default function(Vue: typeof _Vue): void  {
  /**
   * Format the given amount as a currency.
   * 
   * @param amount The integer amount, unscaled.
   * @param currency The currency
   * @param options Format options.
   */
  Vue.prototype.$currency = function(amount: number, currency: Currency, options?: CurrencyFormat): string {
    
    // Decimals and scale are true if undefined.
    const decimals = options?.decimals ?? true;
    const scale = options?.scale ?? true;

    if (scale) {
      amount = amount / (10 ** currency.attributes.scale);
    }

    const format: NumberFormatOptions | undefined = 
    decimals ? {
      minimumFractionDigits: currency.attributes.decimals,
      maximumFractionDigits: currency.attributes.decimals,
    } : undefined;

    // Use vue-i18n $n to localize the number and append the currency symbol.
    return `${this.$n(amount, format)} ${currency.attributes.symbol}`;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $currency: (amount: number, currency: Currency, options?: CurrencyFormat) => string;
  }
}