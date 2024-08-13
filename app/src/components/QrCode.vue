<template>
  <q-img :src="qrDataUrl" />
</template>
<script setup lang="ts">
import qrcode from 'qrcode'
import { ref, watch } from 'vue'

const props = defineProps<{
  data: string
}>()

const qrDataUrl = ref<string>()
watch(() => props.data, async (data) => {
  qrDataUrl.value = await qrcode.toDataURL(data, {errorCorrectionLevel: 'low', color: {dark: "#222"}})
}, { immediate: true })

</script>