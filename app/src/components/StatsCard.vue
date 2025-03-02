<template>
  <q-card
    flat
    bordered
  >
    <q-card-section>
      <div class="text-overline text-onsurface-m">
        <q-icon
          :name="icon"
          size="xs"
          color="icon-dark"
        />
        {{ title }}
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <h3 class="q-mt-none q-mb-xs">
        {{ value }}
      </h3>
      <div 
        v-if="change"
        class="text-h6"
        :class="changeSign > 0 ? 'positive-amount' : 'negative-amount'"
      >
        <q-icon
          :name="changeSign > 0 ? 'trending_up' : 'trending_down'"
        />
        {{ change }}%
      </div>
      <div class="text-caption">
        {{ text }}
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { useCurrencyStats } from 'src/composables/currencyStats';
import formatCurrency from 'src/plugins/FormatCurrency';
import { Currency } from 'src/store/model';
import { computed } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  title: string
  icon: string
  currency: Currency
  /** 
   * The period for which the stats are computed, until now (in seconds).
   * */  
  period?: number
  text: string
}>()

const options = computed(() => ({
  currency: props.currency,
  value: "volume" as const,
  from: props.period ? new Date(Date.now() - (props.period)*1000) : undefined,
  previous: !!(props.period)
}))

const stats = useCurrencyStats(options)
const value = computed(() => {
  const data = stats.value?.values?.[0]
  return data ? formatCurrency(data , props.currency, {decimals: false}) : ""
})

const changeVal = computed(() => {
  const data = stats.value?.values?.[0]
  const previous = stats.value?.previous?.[0]
  if (data && previous) {
    return (data - previous) / previous * 100
  }
  return undefined
})

const change = computed(() => changeVal.value ? changeVal.value.toFixed(2) : "")
const changeSign = computed(() => changeVal.value ? Math.sign(changeVal.value) : 0)

</script>