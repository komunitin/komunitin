<template>
  <q-input
    v-model="value"
    :error-message="$t('ErrorNFCUnavailable')"
    :error="!isNfcAvailable"
    :disabled="!isNfcAvailable"
    readonly
    @focus="startScan"
    @click="startScan"
  >
    <template #append>
      <q-icon name="nfc" />
    </template>
    <q-dialog 
      v-model="scanning"
      persistent
    >
      <div class="column q-gutter-y-lg">
        <q-spinner-radio 
          :size="100"
          color="onoutside"
        />
        <div class="text-onoutside">
          {{ $t('scanningNfc') }}
        </div>
        <q-btn
          flat
          color="white"
          :label="$t('cancel')"
          @click="stopScan()"
        />
      </div>
    </q-dialog>
  </q-input>
</template>
<script setup lang="ts">
import KError, { KErrorCode } from "src/KError"
import { computed, onBeforeUnmount, ref } from "vue"

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const checkNfcAvailable = () => {
  try {
    if (!("NDEFReader" in window)) {
      return false
    }
    new NDEFReader()
    return true
  } catch (error) {
    return false
  }
}
const isNfcAvailable = checkNfcAvailable()


const scan = (ctrl: AbortController) => new Promise<{serialNumber: string}>((resolve, reject) => {
  if (!isNfcAvailable) {
    reject(new KError(KErrorCode.NFCUnavailable, 'NFC not available'))
    return
  }
  try {
    const ndef = new NDEFReader()
    ndef.addEventListener("reading", (event) => {
      resolve(event as NDEFReadingEvent)
    }, {once: true})
    ndef.addEventListener("readingerror", (error) => {
      reject(error)
    }, {once: true})
    
    ndef.scan({
      signal: ctrl.signal
    }).catch((err: Error) => reject(err))
  } catch (error) {
    reject(error)
  }
})

const scanning = ref(false)

let ctrl : AbortController

const startScan = async () => {
  if (scanning.value) {
    return
  }
  try {
    scanning.value = true
    ctrl = new AbortController()

    const {serialNumber} = await scan(ctrl)
    value.value = `${serialNumber}`

  } catch (error) {
    if (error instanceof KError) {
      throw error
    } else {
      throw new KError(KErrorCode.NFCReadError, (error as Error).message, error)  
    }
  } finally {
    ctrl.abort()
    scanning.value = false
  }
}

const stopScan = () => {
  ctrl.abort()
  scanning.value = false
}

onBeforeUnmount(() => {
  if (ctrl) {
    ctrl.abort()
  }
})

</script>