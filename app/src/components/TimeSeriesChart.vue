<template>
  <line-chart 
    :options="options"
    :data="datasets"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { Chart, Tooltip, TimeScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Line as LineChart } from 'vue-chartjs'
import "chartjs-adapter-date-fns" //overrides default date adapter as a side effect

import { CurrencyStatsOptions, previousDate, roundDate } from 'src/composables/currencyStats'
import { Currency } from 'src/store/model'
import { getDateLocale } from "../boot/i18n"

Chart.register(Tooltip, Filler, LinearScale, TimeScale, PointElement, LineElement)

const props = defineProps<{
  currency: Currency
  data: number[]
  previous?: number[]
  interval: CurrencyStatsOptions['interval']
  to?: Date
}>()

const mainData = computed(() => {
  // Computing dates backwards from "to".
  const date = roundDate(props.to || new Date(), props.interval)
  const data = []
  for (let i = props.data.length - 1; i >= 0; i--) {
    data.unshift({
      x: new Date(date.getTime()),
      y: props.data[i]
    })
    previousDate(date, props.interval)
  }
  return data
})

const unit = computed(() => {
  switch (props.interval) {
    case 'PT1H':
      return 'hour'
    case 'P1D':
      return 'day'
    case 'P1W':
      return 'week'
    case 'P1M':
      return 'month'
    case 'P1Y':
      return 'year'
  }
  return undefined
})

const options = computed<ChartOptions<"line">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: unit.value
      },
      adapters: {
        date: {
          locale: getDateLocale()
        }
      }
    },
    y: {
      beginAtZero: true
    },
  },
  
}))
type TimePoint = {x: Date, y: number}
const datasets = computed<ChartData<"line", TimePoint[]>>(() => ({
  datasets: [{
    data: mainData.value,
    borderColor: '#2f7989',
    fill: '#FFFFFF',
  }]
}))
</script>