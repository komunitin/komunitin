<template>
  <div>
    <page-header
      :title="$t('statistics')"
    >
    </page-header>
    <q-page-container>
      <q-page class="q-pa-md q-gutter-md">
        <group-header :group="group" />
        <div class="text-overline">
          {{ $t('volume') }}
        </div>
        <div class="row">
          <stats-card
            class="col-12 col-sm-6 col-md-3"
            icon="show_chart"
            :title="$t('dailyVolume')"
            :text="$t('dailyVolumeText')"
            :value="formatCurrency(last24hValue, currency, {decimals: false})"
            :change="0"
          />
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
  change: false
})
const last24hValue = computed(() => last24h.value?.values?.[0] || 0)

</script>
