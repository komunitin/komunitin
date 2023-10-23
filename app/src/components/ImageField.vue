<template>
  <div>
    <q-uploader 
      ref="uploader"  
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
      :field-name="fieldName"
      :url="url"
      :headers="headers"
      @uploaded="uploaded"
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
import { ref, watch, computed } from 'vue'
import { KOptions } from 'src/boot/koptions'
import { useStore } from 'vuex'
import { QUploader } from 'quasar'

const props = defineProps<{
  modelValue: string[],
  label: string,
  hint?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// Set files from modelValue to the QUploader component
const uploader = ref<QUploader>()

const urlToFile = async (url: string, name: string, type: string) => {
  const response = await fetch(url)
  const blob = await response.blob()
  const file = new File([blob], name, {type})
  return file
}

const setInitialFile = async (url: string) => {
  const filename = (url: string) => url.substring(url.lastIndexOf('/') + 1)
  const extension = (url: string) => url.substring(url.lastIndexOf('.') + 1)

  const file = await urlToFile(url, filename(url), "image/" + extension(url))
  uploader.value?.addFiles([file])
  uploader.value?.updateFileStatus(file, 'uploaded', 0)
}

const setInitialFiles = async () => {
  const files = props.modelValue
  if (files && files.length > 0) {
    const promises = files.map((url) => setInitialFile(url))
    await Promise.all(promises)
  }
}
// should we watch props here?
setInitialFiles()
const images = ref<string[]>(props.modelValue)

const uploaded = ({xhr}: {xhr: XMLHttpRequest}) => {
  const response = JSON.parse(xhr.responseText)
  const url = response.data.attributes.url
  images.value = [...images.value, url]
}

watch(images, (value) => {
  emit("update:modelValue", value)
})

// I'd prefer just "file" but Drupal backend requires it to be file[something],
// and the aesthetics of a good name does not pay for the work today ;)
const fieldName = "files[file]"
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