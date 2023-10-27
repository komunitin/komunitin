<template>
  <div 
    class="relative-position rounded-borders image-field-item"
    :style="{'background-image': `url(${file.__img.src})`}"
  >
    <div class="row flex-center no-wrap q-pa-sm rounded-borders image-field-item-header q-pb-md">
      <q-icon
        v-if="file.__status == 'failed'"
        name="error"
        color="negative" 
      />
      <q-circular-progress
        v-if="file.__status == 'uploading'"
        :value="file.__progress"
        :min="0"
        :max="1"
        :indeterminate="file.__progress === 0"
      />
      <div class="col" />
      <q-btn
        v-if="file.__status == 'uploaded'"
        class="self-end"
        round
        dense
        flat
        color="white"
        icon="close"
        @click="emit('remove:file', file)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
interface ImageFile {
  name: string,
  __sizeLabel: string,
  __progressLabel: string,
  __progress: number,
  __status: string,
  __img: {
    src: string
  }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  file: ImageFile
}>()
const emit = defineEmits<{
  (e: 'remove:file', file: ImageFile): void
}>()
</script>
<style scoped lang="scss">
.image-field-item {
  aspect-ratio: 4/3;
  height: auto;
  background-size: cover;
  background-position: center;
}

.image-field-item-header {
  background: linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0));
}
</style>