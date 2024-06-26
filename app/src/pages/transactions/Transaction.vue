<template>
  <div>
    <page-header 
      :title="$t('transaction')"
      :back="`/groups/${code}/members/${myMember?.attributes.code}/transactions`"
      balance
    />
    <q-page-container
      class="row justify-center bg-light"
    >
      <q-page
        v-if="!isLoading"
        padding
        class="q-py-lg col-12 col-sm-8 col-md-6"
      >
        <transaction-card :transfer="transfer">
          <div v-if="isPendingMe">
            <q-separator />
            <q-card-actions class="justify-end">
              <q-btn 
                :label="$t('reject')"
                color="primary"
                flat
                padding="xs lg"
                @click="updateTransactionState('rejected')"
              />
              <q-btn
                :label="$t('accept')"
                type="submit"
                color="primary"
                padding="xs lg"
                unelevated
                @click="updateTransactionState('committed')"
              />
            </q-card-actions>  
          </div>
        </transaction-card>
      </q-page>
    </q-page-container>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useQuasar } from "quasar"
import { useStore } from "vuex"
import PageHeader from "../../layouts/PageHeader.vue"
import {ExtendedTransfer, Transfer, TransferState} from "../../store/model"
import { useI18n } from "vue-i18n"

import TransactionCard from "../../components/TransactionCard.vue"
import { UpdatePayload } from "../../store/resources"
import {notifyTransactionState} from "../../plugins/NotifyTransactionState"

const props = defineProps<{
  code: string,
  transferCode: string
}>()

const ready = ref(false)

const store = useStore()
const { t } = useI18n()
const quasar = useQuasar()

const myAccount = computed(() => store.getters.myAccount)
const myMember = computed(() => store.getters.myMember)

const transfer = computed<ExtendedTransfer>(() => store.getters["transfers/current"])
const isLoading = computed(() => !(ready.value || transfer.value && transfer.value.payee.member && transfer.value.payer.member))
const isPendingMe = computed(() => (transfer.value?.attributes.state == 'pending') && (myAccount.value.id == transfer.value.payer.id))

const fetchData = async (transferCode: string) => {
  // fetch transfer and accounts.
  await store.dispatch("transfers/load", {
    code: transferCode,
    group: props.code,
    include: "payer,payee,currency"
  })
  // fetch account members in a separate call, since the relation
  // account => member does not exist, only the member => account relation.
  await store.dispatch("members/loadList", {
    group: props.code,
    filter: {
      account: transfer.value.payee.id + "," + transfer.value.payer.id
    },
    onlyResources: true
  })
  ready.value = true
}

const updateTransactionState = async(state: TransferState) => {
  try {
    quasar.loading.show({
      delay: 200
    })
    const payload: UpdatePayload<Transfer> = {
      code: props.transferCode,
      group: props.code,
      resource: {
        id: transfer.value.id,
        type: transfer.value.type,
        attributes: {
          state
        }
      } 
    }
    await store.dispatch("transfers/update", payload)
    notifyTransactionState(transfer.value.attributes.state, t)
  } finally {
    quasar.loading.hide()
  }
  // Fetch transfer again so it also updates accounts (and the user balance).
  await fetchData(props.transferCode)
}

watch(() => props.transferCode, fetchData, { immediate: true })
</script>