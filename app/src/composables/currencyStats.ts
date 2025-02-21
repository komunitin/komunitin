import { checkFetchResponse } from "src/KError";
import { Currency } from "src/store/model";
import { computed, MaybeRefOrGetter, ref, toRef, toValue, watch } from "vue";
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
   * If true, returns also the stats for the previous timeframe.
   */
  previous?: boolean
  /**
   * The interval of the stats. Default to all time so a single value is returned.
   */
  interval?: "PT1H" | "P1D" | "P1W" | "P1M" | "P1Y" 
}

async function getCurrencyStats(options: Omit<CurrencyStatsOptions, "change">, accessToken: string) {
  const {currency, value, from, to, interval} = options

  // Get the accounting api url
  const baseUrl = currency.links.self.replace(/\/currency$/, "")
  let url = `${baseUrl}/stats/${value}`
  // Build the query
  const query = new URLSearchParams()
  if (from) query.set("from", from.toISOString())
  if (to) query.set("to", to.toISOString())
  if (interval) query.set("interval", interval)

  if (query.toString()) {
    url += "?" + query.toString()
  }
  
  // Fetch the data
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
  })
  await checkFetchResponse(response)

  const data = await response.json()
  return data.data.attributes.values
}

export function useCurrencyStats(options: MaybeRefOrGetter<CurrencyStatsOptions>) {
  const result = ref<{
    values?: number[]
    previous?: number[]
  }>({})

  const store = useStore()

  watch(toRef(options), async () => {
    const {value, currency, from, to, previous, interval} = toValue(options)
    
    const accessToken = store.getters.accessToken
    // Get base interval
    result.value.values = await getCurrencyStats({value, currency, from, to, interval}, accessToken)
    if (previous) {
      if (!from) {
        throw new Error("Cannot compute change without a start date")
      }
      const newFrom = new Date(from.getTime() - ((to?.getTime() ?? Date.now()) - from.getTime()))
      result.value.previous = await getCurrencyStats({value, currency, from: newFrom, to: from, interval}, accessToken)
    }

  }, {immediate: true})

  return result
}

/**
 * 
 * @param period The period for which the stats are computed, until now (in seconds).
 * @returns The value and the change in percentage of the currency volume for the given period.
 */
export function useCurrencyStatsSingleValueAndChange(currency: MaybeRefOrGetter<Currency>, period: MaybeRefOrGetter<number>) {
  const options = computed(() => ({
    currency: toValue(currency),
    value: "volume" as const,
    from: new Date(Date.now() - toValue(period)*1000),
    previous: true
  }))
  const stats = useCurrencyStats(options)
  const value = computed(() => stats.value?.values?.[0] || 0)
  const change = computed(() => {
    const previous = stats.value?.previous?.[0]
    return previous ? (value.value - previous) / previous * 100 : 0
  })
  return {value, change}
}