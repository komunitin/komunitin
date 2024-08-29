
import { MaybeRefOrGetter, toValue } from "@vueuse/shared"
import { AccountSettings, CurrencySettings } from "src/store/model"
import { computed } from "vue"
import { useStore } from "vuex"


export const currencySettingsToAccountSettingsAttributes = (currencySettings: CurrencySettings) => {
  const vals = currencySettings.attributes
  return {
    allowPayments: vals.defaultAllowPayments ?? false,
    allowPaymentRequests: vals.defaultAllowPaymentRequests ?? false,
    acceptPaymentsAutomatically: vals.defaultAcceptPaymentsAutomatically ?? false,
    allowSimplePayments: vals.defaultAllowSimplePayments ?? false,
    allowSimplePaymentRequests: vals.defaultAllowSimplePaymentRequests ?? false,
    allowQrPayments: vals.defaultAllowQrPayments ?? false,
    allowQrPaymentRequests: vals.defaultAllowQrPaymentRequests ?? false,
    allowTagPayments: vals.defaultAllowTagPayments ?? false,
    allowTagPaymentRequests: vals.defaultAllowTagPaymentRequests ?? false,
    allowMultiplePayments: vals.defaultAllowMultiplePayments ?? false,
    allowMultiplePaymentRequests: vals.defaultAllowMultiplePaymentRequests ?? false,
    acceptPaymentsAfter: vals.defaultAcceptPaymentsAfter ?? undefined,
    onPaymentCreditLimit: vals.defaultOnPaymentCreditLimit ?? undefined,
    allowExternalPayments: vals.defaultAllowExternalPayments ?? false,
    allowExternalPaymentRequests: vals.defaultAllowExternalPaymentRequests ?? false,
    acceptExternalPaymentsAutomatically: vals.defaultAcceptExternalPaymentsAutomatically ?? false,
  } as AccountSettings["attributes"]
}

export const accountSettingsToCurrencySettingsAttributes = (accountSettings: AccountSettings) => {
  // Build the attributes for the currency-settings object. The keys are the same
  // as the account settings object but with the "default" prefix.
  const accountDefaults = {} as Record<string, unknown>
  for (const key of Object.keys(accountSettings.attributes)) {
    const defaultKey = "default" + key[0].toUpperCase() + key.slice(1) as keyof CurrencySettings["attributes"]
    accountDefaults[defaultKey] = accountSettings.attributes[key as keyof AccountSettings["attributes"]]
  }
  return accountDefaults as CurrencySettings["attributes"]
}

export const effectiveSettings = (accountSettings: AccountSettings, currencySettings: CurrencySettings) => {
  const defaults = currencySettingsToAccountSettingsAttributes(currencySettings)
  const vals = accountSettings.attributes
  const attributes = {} as Record<string, unknown>
  
  Object.entries(defaults).forEach(([key, value]) => {
    attributes[key] = vals[key as keyof AccountSettings["attributes"]] ?? value
  })

  return attributes
}

export const useEffectiveSettings = (accountSettings: MaybeRefOrGetter<AccountSettings|undefined>, currencySettings: MaybeRefOrGetter<CurrencySettings|undefined>) => {
  return computed(() => {
    const account = toValue(accountSettings)
    const currency = toValue(currencySettings)
    if (account && currency) {
      return effectiveSettings(account, currency)
    } else {
      return undefined
    }
  })  
}


export const useMyAccountSettings = () => {
  const store = useStore()

  const settings = computed(() => {
    const account = store.getters.myAccount
    const accountSettings = account?.settings.attributes
    const currencySettings = account?.currency.attributes.settings
    // Not ready yet
    if (accountSettings && currencySettings) {
      return effectiveSettings(accountSettings, currencySettings)
    } else {
      // Not ready yet
      return undefined
    }
  })

  return settings
}
