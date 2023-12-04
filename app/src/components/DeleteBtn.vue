<template>
  <q-btn
    icon="delete"
    round
    flat
    v-bind="$attrs"
    @click="confirm = true"
  >
    <q-dialog v-model="confirm">
      <q-card class="q-pa-md">
        <q-card-section class="row items-center">
          <q-avatar
            icon="delete"
            color="negative"
            text-color="white"
          />
          <div class="column q-ml-md">
            <div>
              <slot />
            </div>
            <div>
              {{ $t('cantBeUndone') }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$t('cancel')"
            color="onsurface-m"
          />
          <q-btn 
            v-close-popup
            unelevated
            fill
            :label="$t('delete')"
            color="negative"
            @click="emit('confirm')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-btn>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const confirm = ref(false)

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

</script>