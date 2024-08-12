<template>
  <q-img :src="qrDataUrl" />
</template>
<script setup lang="ts">
import QRCode from 'qrcode'
import { ref, watch } from 'vue'

const props = defineProps<{
  data: string
}>()

const qrDataUrl = ref<string>()
watch(() => props.data, async (data) => {
  qrDataUrl.value = await QRCode.toDataURL(data, {errorCorrectionLevel: 'low', color: {dark: "#222"}})
}, { immediate: true })

</script>