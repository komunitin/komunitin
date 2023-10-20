<template>
  <div>
    <q-uploader 
      v-model="image"
      multiple
      accept="image/*"
      :label="label"
      color="white"
      text-color="onsurface-m"
      flat
      bordered
      class="full-width max-h"
      auto-upload
      hide-upload-btn
      field-name="file"
      :url="url"
      :headers="headers"
    />
    <div
      v-if="hint" 
      class="text-onsurface-m q-pt-sm text-caption"
      style="padding-left: 12px; line-height: 1;"
    >
      {{ hint }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { KOptions } from 'src/boot/koptions'
import { useStore } from 'vuex'

const props = defineProps<{
  modelValue: string[],
  label: string,
  hint?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const image = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const url = KOptions.url.files

const store = useStore()
const headers = () => {
  const token = store.getters.accessToken
  return [{name : 'Authorization', value: `Bearer ${token}`}]
}

</script>
<style lang="scss">
.q-uploader {
  max-height: none;
}
.q-uploader__file--img {
  aspect-ratio: 4/3;
  height: auto;
}
</style>