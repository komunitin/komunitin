import _Vue from 'vue';
import { Currency } from 'src/store/model';
import { NumberFormatOptions } from 'vue-i18n';

export interface CurrencyFormat {
  /**
   * Whether to render all the decimals. Default to true.
   */
  decimals?: boolean
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
    amount = amount / (10 ** currency.attributes.scale);
    
    // Decimals is true if undefined.
    const decimals = options?.decimals ?? true; 

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