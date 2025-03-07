<template>
  <q-card 
    flat
    bordered
  >
    <q-card-section class="row items-top justify-between">
      <div class="col-12 col-sm-4">
        <div class="text-overline text-onsurface-m">
          <q-icon
            :name="icon"
            size="xs"
            color="icon-dark"
          />
            {{ title }}
        </div>
        <div class="q-pt-none">
          <div>
            <h3 class="q-mt-none q-mb-xs">
              {{ value }}
            </h3>    
            <div 
              v-if="change"
              class="text-h6"
              :class="sign > 0 ? 'positive-amount' : 'negative-amount'"
            >
              <q-icon
                :name="sign > 0 ? 'trending_up' : 'trending_down'"
              />
              {{ change }}
            </div>
          </div>
          <div class="text-caption">
            {{ text }}
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-4">
        <div class="column q-gutter-y-md">
          <div>
            <q-select v-model="period" outlined name="period" :options="periodOptions" :label="$t('period')" />
          </div>
          <div>
            <q-select v-model="interval" outlined name="interval" :options="intervalOptions" :label="$t('interval')" />
          </div>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <time-series-chart 
        :currency="currency"
        :data="data.values ?? []"
        :previous="data.previous"
        :interval="interval.value"
        :to="period.value.to"
      />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { roundDate, useCurrencyStats, useCurrencyStatsFormattedValue } from 'src/composables/currencyStats'
import { Currency } from 'src/store/model'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TimeSeriesChart from './TimeSeriesChart.vue'

const props = defineProps<{
  title: string
  icon: string
  currency: Currency
  text: string
}>()

// Define the periods and make them start at round times so the
// first chart value is meaningful.
const last24h = new Date()
last24h.setDate(last24h.getDate() - 1)

const last7days = new Date()
last7days.setDate(last7days.getDate() - 7)

const last30days = new Date()
last30days.setDate(last30days.getDate() - 30)

const thisQuarter = new Date()
thisQuarter.setMonth(Math.floor(thisQuarter.getMonth() / 3) * 3)
thisQuarter.setDate(1)

const lastQuarter = new Date()
lastQuarter.setMonth(Math.floor(lastQuarter.getMonth() / 3) * 3 - 3)
lastQuarter.setDate(1)

const last12months = new Date()
last12months.setFullYear(last12months.getFullYear() - 1)

const thisYear = new Date()
thisYear.setMonth(0, 1)
thisYear.setHours(0, 0, 0, 0)

const lastYear = new Date()
lastYear.setFullYear(lastYear.getFullYear() - 1)
lastYear.setMonth(0, 1)
lastYear.setHours(0, 0, 0, 0)

const last5years = new Date()
last5years.setFullYear(last5years.getFullYear() - 5)
last5years.setMonth(0, 1)
last5years.setHours(0, 0, 0, 0)

const {t} = useI18n()

const periodOptions = [
  {label: t('24hours'), value: { from: last24h } },
  {label: t('7days'), value: { from: last7days } },
  {label: t('30days'), value: { from: last30days } },
  {label: t('thisQuarter'), value: { from: thisQuarter } },
  {label: t('lastQuarter'), value: { from: lastQuarter, to: thisQuarter} },
  {label: t('12months'), value: { from: last12months } },
  {label: t('thisYear'), value: { from: thisYear } },
  {label: t('lastYear'), value: { from: lastYear, to: thisYear} },
  {label: t('last5years'), value: { from: last5years } },
  {label: t('allTime'), value: {} }
]

const period = ref(periodOptions[5]) // 12 months

// Get stats data for the single value
const valueOptions = computed(() => ({
  currency: props.currency,
  value: "volume" as const,
  from: period.value.value.from,
  to: period.value.value.to,
  change: true
}))

const {value, change, sign} = useCurrencyStatsFormattedValue(valueOptions)

// period duration in seconds or Infinity if all time
const duration = computed(() => period.value.value.from ? ((period.value.value.to?.getTime() ?? new Date().getTime()) - period.value.value.from.getTime())/1000 : +Infinity)

// Note that intervals are always the natural ones. For example hour
// always starts at XX:00:00 and ends at XX:59:59. First and last 
// values may have less width depending on period.
const intervalOptions = computed(() => [
  {label: t('hour'), value: 'PT1H' as const, disable: duration.value > 365*24*60*60},
  {label: t('day'), value: 'P1D' as const, disable: duration.value < 2*24*60*60},
  {label: t('week'), value: 'P1W' as const, disable: duration.value < 2*7*24*60*60},
  {label: t('month'), value: 'P1M' as const, disable: duration.value < 2*30*24*60*60},
  {label: t('year'), value: 'P1Y' as const, disable: duration.value < 2*365*24*60*60},
])

const interval = ref(intervalOptions.value[3]) // Month
const options = computed(() => {
  // Rounding the from date to the nearest interval break so the first
  // value has the same width as the others.
  const from = period.value.value.from ? roundDate(period.value.value.from, interval.value.value) : undefined

  return ({
    currency: props.currency,
    value: "volume" as const,
    from: from,
    to: period.value.value.to,
    interval: interval.value.value,
    previous: true
  })
})

const data = useCurrencyStats(options)



</script>