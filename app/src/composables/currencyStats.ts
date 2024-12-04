import { checkFetchResponse } from "src/KError";
import { Currency } from "src/store/model";
import { MaybeRefOrGetter, ref, toRef, toValue, watch } from "vue";
import { useStore } from "vuex";

export interface CurrencyStatsOptions {
  currency: Currency
  value: "volume"
  /**
   * The start date of the stats. Default to all time.
   */
  from?: Date
  /**
   * The end date of the stats. Default to now.
   */
  to?: Date
  /**
   * If true, returns the change in the value.
   */
  change?: boolean
  /**
   * The interval of the stats. Default to all time so a single value is returned.
   */
  interval?: "PT1H" | "P1D" | "P1W" | "P1M" | "P1Y" 
}

export function useCurrencyStats(options: MaybeRefOrGetter<CurrencyStatsOptions>) {
  const result = ref<{
    values?: number[]
    change?: number[]
  }>({})

  const store = useStore()

  watch(toRef(options), async () => {
    const {value, currency, from, to, change, interval} = toValue(options)

    if (!currency || !value) return

    // Get the accounting api url
    const baseUrl = currency.links.self.replace(/\/currency$/, "")
    const url = `${baseUrl}/stats/${value}`
    // Build the query
    const query = new URLSearchParams()
    if (change) {
      throw new Error("Not implemented yet.")
    } else {
      if (from) query.set("from", from.toISOString())
      if (to) query.set("to", to.toISOString())
      if (interval) query.set("interval", interval)
    }
    const accessToken = store.getters.accessToken
    // Fetch the data
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      },
    })
    await checkFetchResponse(response)

    const data = await response.json()
    const values = data.data.attributes.values
    
    // Update the result ref
    result.value = {values}

  }, {immediate: true})

  return result
}