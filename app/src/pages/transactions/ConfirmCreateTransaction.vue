<template>
  <page-header 
    :title="$t('createTransaction')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}/transactions/new`"
  />
  <q-page-container class="row justify-center bg-light">
    <q-page class="q-py-lg col-12 col-sm-8 col-md-6">
      <q-form @submit="onSubmit">
        <transaction-card :transfer="transfer">
          <q-separator />
          <q-card-actions class="justify-end">
            <q-btn 
              :label="$t('back')"
              color="primary"
              flat
              padding="xs lg"
              @click="onBack"
            />
            <q-btn
              :label="$t('confirm')"
              type="submit"
              color="primary"
              padding="xs lg"
              unelevated
            />
          </q-card-actions>
        </transaction-card>
      </q-form>
    </q-page>
  </q-page-container>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { useQuasar } from "quasar"
import TransactionCard from '../../components/TransactionCard.vue'
import PageHeader from "../../layouts/PageHeader.vue"
import {notifyTransactionState} from "../../plugins/NotifyTransactionState"

export default defineComponent({
  components: {
    PageHeader,
    TransactionCard
  },
  props: {
    code: {
      type: String,
      required: true
    },
    memberCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const quasar = useQuasar()

    const {t} = useI18n()

    const transfer = computed(() => store.getters["transfers/current"])
    
    const onSubmit = async () => {
      quasar.loading.show({
        delay: 200
      })
      try {
        transfer.value.attributes.state = "committed"
        await store.dispatch("transfers/create", {
          group: props.code,
          resource: transfer.value
        });
        
        notifyTransactionState(transfer.value.attributes.state, t)

        router.push({
          name: "Transaction",
          params: {
            code: props.code,
            transferCode: transfer.value.id
          }
        })
      } finally {
        quasar.loading.hide()
      }
    }
    const onBack = () => {
      router.back()
    }
    return { transfer, onSubmit, onBack, ...props }
  }
})
</script>