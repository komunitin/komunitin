<template>
  <q-uploader
    ref="uploader"
    class="avatar-field-uploader q-mx-auto"
    accept="image/*"
    flat
    bordered
    auto-upload
    hide-upload-btn
    :url="url"
    :headers="headers"
    :field-name="fieldName"
    @uploaded="uploaded"
  >
    <template #header>
      <q-uploader-add-trigger />
    </template>
    <template #list>
      <div @click="uploader?.pickFiles">
        <avatar 
          :img-src="src" 
          :text="text"
          size="250px"
          class="q-mx-auto"
        />
        <div class="avatar-icon">
          <q-circular-progress
            v-if="file.__status == 'uploading'"
            :value="file.__progress"
            :min="0"
            :max="1"
            :indeterminate="file.__progress === 0"
            color="white"
            size="50px"
          />
          <q-icon
            v-else
            :name="file.__status == 'failed' ? 'error' : 'add_a_photo'"
            size="50px"
            color="white" 
          />
        </div>
      </div>
    </template>
  </q-uploader>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { imageFile, useUploaderSettings } from "../composables/uploader"
import Avatar from "./Avatar.vue"
import { QUploader } from "quasar"

const props = defineProps<{
  modelValue: string | null,
  text: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const uploader = ref<QUploader>()
const src = computed(() => uploader.value?.files[0]?.__img?.src || props.modelValue)
const file = computed(() => uploader.value?.files[0] || imageFile(props.modelValue ?? ""))

const { url, headers, fieldName } = useUploaderSettings()

const uploaded = ({xhr}: {xhr: XMLHttpRequest}) => {
  const response = JSON.parse(xhr.responseText)
  const url = response.data.attributes.url
  emit("update:modelValue", url)
  uploader.value?.removeUploadedFiles()
}

</script>
<style lang="scss" scoped>
.avatar-field-uploader {
  width: fit-content;
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    .avatar-icon {
      opacity: 1;
    }
  }
}
.avatar-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -25px;
  margin-top: -25px;
  opacity: 0.85;
}

</style>