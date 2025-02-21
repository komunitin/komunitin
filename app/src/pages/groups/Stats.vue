<template>
  <div>
    <page-header
      :title="$t('statistics')"
    >
    </page-header>
    <q-page-container>
      <q-page class="q-pa-md">
        <group-header :group="group" class="q-pl-none" />
        <div class="text-overline text-uppercase text-onsurface-m q-mt-lg q-mb-sm">
          {{ $t('volume') }}
        </div>
        <div class="row q-col-gutter-md items-stretch">
          <div class="col-12 col-sm-6 col-lg-3">
            <stats-card
              class="full-height"
              icon="today"
              :title="$t('dailyVolume')"
              :text="$t('dailyVolumeText')"
              :value="formatCurrency(last24hValue, currency, {decimals: false})"
              :change="last24hChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <stats-card
              class="full-height"
              icon="calendar_month"
              :title="$t('monthlyVolume')"
              :text="$t('monthlyVolumeText')"
              :value="formatCurrency(last30dValue, currency, {decimals: false})"
              :change="last30dChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <stats-card
              class="full-height"
              icon="sunny"
              :title="$t('yearlyVolume')"
              :text="$t('yearlyVolumeText')"
              :value="formatCurrency(last365dValue, currency, {decimals: false})"
              :change="last365dChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <stats-card
              class="full-height"
              icon="all_inclusive"
              :title="$t('allTimeVolume')"
              :text="$t('allTimeVolumeText')"
              :value="formatCurrency(allValue, currency, {decimals: false})"
            />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </div>
</template>
<script setup lang="ts">
import { useStore } from 'vuex'
import { computed, watch, toValue } from 'vue'
import { Currency, Group } from 'src/store/model'

import GroupHeader from 'src/components/GroupHeader.vue';
import PageHeader from 'src/layouts/PageHeader.vue';
import StatsCard from 'src/components/StatsCard.vue';
import formatCurrency from 'src/plugins/FormatCurrency';
import { useCurrencyStatsSingleValueAndChange, useCurrencyStats } from 'src/composables/currencyStats';

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
const {value: last24hValue, change: last24hChange} = useCurrencyStatsSingleValueAndChange(currency, 24*60*60)
const {value: last30dValue, change: last30dChange} = useCurrencyStatsSingleValueAndChange(currency, 30*24*60*60)
const {value: last365dValue, change: last365dChange} = useCurrencyStatsSingleValueAndChange(currency, 365*24*60*60)
const allVolume = useCurrencyStats(computed(() => ({
  currency: toValue(currency),
  value: "volume" as const
})))
const allValue = computed(() => allVolume.value?.values?.[0] || 0)

</script>
