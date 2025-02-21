<template>
  <div>
    <page-header
      :title="$t('statistics')"
    >
    </page-header>
    <q-page-container>
      <q-page class="q-pa-md">
        <group-header :group="group" class="q-pl-none" />
        <div class="text-overline text-uppercase text-onsurface-m">
          {{ $t('volume') }}
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <stats-card
              icon="today"
              :title="$t('dailyVolume')"
              :text="$t('dailyVolumeText')"
              :value="formatCurrency(last24hValue, currency, {decimals: false})"
              :change="last24hChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <stats-card
              icon="calendar_month"
              :title="$t('monthlyVolume')"
              :text="$t('monthlyVolumeText')"
              :value="formatCurrency(last30dValue, currency, {decimals: false})"
              :change="last30dChange"
            />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </div>
</template>
<script setup lang="ts">
import { useStore } from 'vuex'
import { computed, watch } from 'vue'
import { Currency, Group } from 'src/store/model'

import GroupHeader from 'src/components/GroupHeader.vue';
import PageHeader from 'src/layouts/PageHeader.vue';
import StatsCard from 'src/components/StatsCard.vue';
import formatCurrency from 'src/plugins/FormatCurrency';
import { useCurrencyStats } from 'src/composables/currencyStats';

const props = defineProps<{
  code: string
}>()

const store = useStore()

// Fetch data
watch(() => props.code, async () => {
  await store.dispatch("groups/load", {
    id: props.code,
    include: "currency",
    cache: 5*60*1000
  })
}, {immediate: true})

const group = computed<Group & {currency: Currency}>(() => store.getters['groups/current'])
const currency = computed<Currency>(() => group.value.currency)

// Compute stats
const last24h = useCurrencyStats({
  currency: currency.value,
  value: "volume",
  from: new Date(Date.now() - 24*60*60*1000),
  previous: true
})
const last24hValue = computed(() => last24h.value?.values?.[0] || 0)
const last24hChange = computed(() => {
  const previous = last24h.value?.previous?.[0]
  return previous ? (last24hValue.value - previous) / previous * 100 : 0
})

const last30d = useCurrencyStats({
  currency: currency.value,
  value: "volume",
  from: new Date(Date.now() - 30*24*60*60*1000),
  previous: true
})
const last30dValue = computed(() => last30d.value?.values?.[0] || 0)
const last30dChange = computed(() => {
  const previous = last30d.value?.previous?.[0]
  return previous ? (last30dValue.value - previous) / previous * 100 : 0
})

</script>
