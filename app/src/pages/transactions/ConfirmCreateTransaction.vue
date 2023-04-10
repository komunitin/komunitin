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
import { useQuasar } from "quasar"
import { defineComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import TransactionCard from '../../components/TransactionCard.vue'
import PageHeader from "../../layouts/PageHeader.vue"

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
    const $q = useQuasar()
    const {t} = useI18n()

    const transfer = store.getters["transfers/current"]
    
    const onSubmit = async () => {
      transfer.attributes.state = "committed"
      await store.dispatch("transfers/create", {
        group: props.code,
        resource: transfer
      });
      const state = transfer.attributes.state;
      switch(state) {
        case "committed":
          $q.notify({type: "positive", message: t("transactionCommitted")});
          break;
        case "pending":
          $q.notify({type: "ongoing", message: t("transactionPending")});
          break;
        case "rejected":
          $q.notify({type: "negative", message: t("transactionRejected")});
          break;
      }
      router.push({
        name: "Transaction",
        params: {
          code: props.code,
          transferCode: transfer.id
        }
      })
    }
    const onBack = () => {
      router.back()
    }
    return { transfer, onSubmit, onBack, ...props }
  }
})
</script>