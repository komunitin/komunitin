import { checkFetchResponse } from "src/KError";
import formatCurrency from "src/plugins/FormatCurrency";
import { Currency } from "src/store/model";
import { computed, MaybeRefOrGetter, ref, toRef, toValue, watch, watchEffect } from "vue";
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
        throw new Error("Cannot compute previous data without a start date")
      }
      const newFrom = new Date(from.getTime() - ((to?.getTime() ?? Date.now()) - from.getTime()))
      result.value.previous = await getCurrencyStats({value, currency, from: newFrom, to: from, interval}, accessToken)
    }

  }, {immediate: true})

  return result
}


/**
 * Composable for getting a single stats value formatted with the percentage change.
 * 
*/
export function useCurrencyStatsFormattedValue(
  options: MaybeRefOrGetter<{
    currency: Currency,
    from?: Date
    to?: Date
    value: "volume"
    change?: boolean
  }>) {

  // The main composable use "previous" instead of "change" so we need to adapt the options
  const statsOptions = computed(() => {
    const opt = toValue(options)
    return {
      ...opt,
      previous: opt.change
    }
  })
  const stats = useCurrencyStats(statsOptions)

  const value = ref("")
  const change = ref("")
  const sign = ref(0)

  watchEffect(() => {
    const data = stats.value?.values?.[0]
    const opt = toValue(options)
    if (data) {
      value.value = formatCurrency(data, opt.currency, {decimals: false})
      if (opt.change && stats.value?.previous) {
        const previous = stats.value.previous[0]
        if (previous) {
          const changeVal = 100 * (data - previous) / previous
          sign.value = Math.sign(changeVal)
          change.value = changeVal.toFixed(1) + "%"
        }
      }
    }
  })

  return {value, change, sign}
}

export const roundDate = (date: Date, interval: CurrencyStatsOptions['interval']) => {
  switch (interval) {
    case 'PT1H':
      date.setMinutes(0, 0, 0)
      break
    case 'P1D':
      date.setHours(0, 0, 0, 0)
      break
    case 'P1W':
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - date.getDay())
      break
    case 'P1M':
      date.setHours(0, 0, 0, 0)
      date.setDate(1)
      break
    case 'P1Y':
      date.setHours(0, 0, 0, 0)
      date.setMonth(0, 1)
      break
  }
  return date
}
export const previousDate = (date: Date, interval: CurrencyStatsOptions['interval']) => {
  switch (interval) {
    case 'PT1H':
      date.setHours(date.getHours() - 1)
      break
    case 'P1D':
      date.setDate(date.getDate() - 1)
      break
    case 'P1W':
      date.setDate(date.getDate() - 7)
      break
    case 'P1M':
      date.setMonth(date.getMonth() - 1)
      break
    case 'P1Y':
      date.setFullYear(date.getFullYear() - 1)
      break
  }
  return date
}