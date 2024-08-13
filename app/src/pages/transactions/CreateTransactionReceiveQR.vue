<template>
  <div class="row justify-center">
    <div class="q-py-lg q-px-md col-12 col-sm-8 col-md-6">
      <div v-if="state === 'define'">
        <create-transaction-single-form
          :code="code"
          :select-payer="false"
          :select-payee="false"
          :payee-account="payeeAccount"
          :currency="currency"
          :text="$t('enterTransactionDataQR')"
          :submit-label="$t('showQRCode')"
          :model-value="transfer"
          @update:model-value="onFilled"
        />  
      </div>
      <div 
        v-if="state === 'show' && transfer"
      >
        <div class="text-subtitle1 q-mb-lg">
          {{ $t('scanThisQR') }}
        </div>
        <q-card 
          flat 
          bordered
        >
          <account-header
            class="q-pt-md"
            :account="payeeAccount"
          />
          <qr-code :data="qrData" />
          
          <q-card-section class="text-center q-pt-none">
            <div class="text-h4 positive-amount">
              {{ FormatCurrency(transfer.attributes.amount, currency) }}
            </div>
            <div class="text-body1">
              {{ transfer.attributes.meta }}
            </div>
          </q-card-section>
        </q-card>
        <div class="row justify-end q-mb-xl">
          <q-btn
            class="q-mt-md"
            color="primary"
            flat
            :label="$t('back')"
            @click="state = 'define'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Currency, Transfer } from "src/store/model";
import { computed, ref } from "vue"
import { useStore } from "vuex";
import CreateTransactionSingleForm from "./CreateTransactionSingleForm.vue";
import AccountHeader from "src/components/AccountHeader.vue";
import QrCode from "src/components/QrCode.vue";
import { useCreateTransferPayeeAccount } from "src/composables/fullAccount";
import FormatCurrency from "src/plugins/FormatCurrency";

const props = defineProps<{
  code: string,
  memberCode?: string,
}>()

const store = useStore()

const state = ref<"define" | "show">("define")

const currency = computed<Currency>(() => store.getters.myAccount.currency);
const payeeAccount = useCreateTransferPayeeAccount(props.code, props.memberCode, "receive")

const transfer = ref<Transfer>()

const onFilled = (value: Transfer) => {
  transfer.value = value
  state.value = "show"
}

const base = window?.location.origin ?? ""

const qrData = computed(() => {
  const query = new URLSearchParams()
  query.set("t", payeeAccount.value?.links.self ?? "")
  query.set("a", transfer.value?.attributes.amount.toString() ?? "")
  query.set("m", transfer.value?.attributes.meta ?? "")
  return `${base}/pay?${query.toString()}`
})
</script>