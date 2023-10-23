<template>
  <q-input
    v-model="localDate"
    :mask="localMask"
    name="date"
    :label="label"
    :hint="hint"
    outlined
    required
  >
    <template #append>
      <q-icon 
        name="event" 
        class="cursor-pointer"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="pickerDate" 
            :mask="pickerMask"
          >
            <div class="row items-center justify-end">
              <q-btn 
                v-close-popup 
                :label="$t('close')" 
                color="primary" 
                flat 
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
<script setup lang="ts">
import { computed } from "vue"
import { getDateLocale } from "../boot/i18n"
import { format, parse } from "date-fns"
const props = defineProps<{
  modelValue: Date | null,
  label: string
  hint?: string
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: Date | null): void
}>()
const locale = getDateLocale()
const pickerMask = "YYYY/MM/DD" // this is the format for QDate component
const pickerFormat = "yyyy/MM/dd" // this is the same format for date-fns
const pickerDate = computed({
  get: () => props.modelValue ? format(props.modelValue, pickerFormat, {locale}) : null,
  set: (value) => emit("update:modelValue", value ? parse(value, pickerFormat, new Date(), {locale}): null)
})
const localFormat = locale?.formatLong?.date({width: "short"})
const localDate = computed({
  get: () => props.modelValue ? format(props.modelValue, localFormat, {locale}) : null,
  set: (value) => emit("update:modelValue", value ? parse(value, localFormat, new Date(), {locale}): null)
})
const localMask = format(new Date(), localFormat, {locale}).replace(/\d/g, "#")
</script>