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
  
  </q-card>
</template>
<script setup lang="ts">
import { Currency } from 'src/store/model';

const props = defineProps<{
  title: string
  icon: string
  currency: Currency
  text: string
}>()
</script>