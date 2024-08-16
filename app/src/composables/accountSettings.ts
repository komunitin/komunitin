
import { computed } from "vue"
import { useStore } from "vuex"

export const useMyAccountSettings = () => {
  const store = useStore()

  const settings = computed(() => {
    const account = store.getters.myAccount
    const accountSettings = account?.settings.attributes
    const currencySettings = account?.currency.attributes.settings

    return {
      acceptPaymentsAutomatically: accountSettings?.acceptPaymentsAutomatically ?? currencySettings?.defaultAcceptPaymentsAutomatically ?? false,

      allowPayments: accountSettings?.allowPayments ?? currencySettings?.defaultAllowPayments ?? false,
      allowPaymentRequests: accountSettings?.allowPaymentRequests ?? currencySettings?.defaultAllowPaymentRequests ?? false,
      
      allowExternalPayments: accountSettings?.allowExternalPayments ?? currencySettings?.defaultAllowExternalPayments ?? false,
      allowExternalPaymentRequests: accountSettings?.allowExternalPaymentRequests ?? currencySettings?.defaultAllowExternalPaymentRequests ?? false,
      
      allowTagPayments: accountSettings?.allowTagPayments ?? currencySettings?.defaultAllowTagPayments ?? false,
      allowTagPaymentRequests: accountSettings?.allowTagPaymentRequests ?? currencySettings?.defaultAllowTagPaymentRequests ?? false,
    }
  })

  return settings
}