<template>
  <q-item
    tag="label"
    style="padding-left: 12px; padding-right: 12px;"
  >
    <q-item-section>
      <q-item-label>
        {{ label }}
      </q-item-label>
      <q-item-label
        v-if="hint"
        caption
      >
        {{ hint }}
      </q-item-label>
    </q-item-section>
    <q-item-section avatar>
      <q-toggle
        v-model="value"
        :true-value="trueValue"
        :false-value="falseValue"
      />
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean | string | number
  label: string
  hint?: string
  trueValue?: boolean | string | number
  falseValue?: boolean | string | number
}>(), {
  trueValue: true,
  falseValue: false,
  modelValue: undefined,
  hint: undefined,
})

const emit = defineEmits<{
  (e: "update:modelValue", value:  boolean | string | number): void
}>()

const value = computed({
  get: () => props.modelValue ?? props.falseValue,
  set: (value:  boolean | string | number) => emit("update:modelValue", value),
})
</script>