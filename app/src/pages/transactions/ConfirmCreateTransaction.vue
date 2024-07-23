<template>  
  <q-form @submit="onSubmit">
    <transaction-card :transfer="transfer">
      <q-separator />
      <q-card-actions class="justify-end">
        <q-btn 
          :label="$t('back')"
          color="primary"
          flat
          padding="xs lg"
          @click="emit('back')"
        />
        <q-btn
          id="confirm-transaction"
          :label="$t('confirm')"
          type="submit"
          color="primary"
          padding="xs lg"
          unelevated
        />
      </q-card-actions>
    </transaction-card>
  </q-form>  
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { DeepPartial, useQuasar } from "quasar"
import TransactionCard from '../../components/TransactionCard.vue'
import {notifyTransactionState} from "../../plugins/NotifyTransactionState"
import { Transfer } from "src/store/model"
import KError, { KErrorCode } from "src/KError"
import { clone } from "lodash-es"

const props = defineProps<{
  code: string;
  transfer: DeepPartial<Transfer>;
}>()

const emit = defineEmits<{
  (e:'back'): void
}>()

const store = useStore()
const router = useRouter()
const quasar = useQuasar()
const {t} = useI18n()

const onSubmit = async () => {
  quasar.loading.show({
    delay: 200
  })
  const transfer = clone(props.transfer)

  if (!transfer.attributes) {
    throw new KError(KErrorCode.ScriptError, "Transfer attributes are missing")
  }

  try {
    transfer.attributes.state = "committed"
    await store.dispatch("transfers/create", {
      group: props.code,
      resource: props.transfer
    });
    notifyTransactionState(transfer.attributes.state, t)
    router.push({
      name: "Transaction",
      params: {
        code: props.code,
        transferCode: props.transfer.id
      }
    })
  } catch (error) {
    transfer.attributes.state = "failed"
    throw error
  } finally {
    quasar.loading.hide()
  }
}

</script>