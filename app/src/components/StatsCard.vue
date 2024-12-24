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
      <h4 class="q-mt-none q-mb-md">
        {{ value }}
      </h4>
      <div 
        v-if="change"
        :class="change > 0 ? 'positive-amount' : 'negative-amount'"
      >
        <q-icon
          :name="change > 0 ? 'trending_up' : 'trending_down'"
        />
        {{ Math.abs(change).toPrecision(2) }}%
      </div>
      <div class="text-caption">
        {{ text }}
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  title: string
  icon: string
  value: string
  change?: number
  text: string
}>()

</script>