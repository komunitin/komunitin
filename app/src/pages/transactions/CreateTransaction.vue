<template>
  <page-header :title="$t('createTransaction')" />
  <q-page-container class="row justify-center">
    <q-page class="q-py-lg col-12 col-sm-8 col-md-6">
      <div v-if="form" class="q-gutter-y-lg column">
        <div>
          <div class="text-subtitle1">{{$t('enterTransactionData')}}</div>
          <div class="text-onsurface-m">{{$t('transactionFormHelpText')}}</div>
        </div>
        <select-member v-model="member" :code="code" :label="$t('selectPayer')" :hint="$t('transactionPayerHint')"/>
        <q-input v-model="concept" :label="$t('description')" :hint="$t('transactionDescriptionHint')" outlined autogrow required>
          <template v-slot:append>
            <q-icon name="notes"/>
          </template>
        </q-input>
        <q-input v-model="amount" :label="$t('amountIn', {currency: myAccount.currency.attributes.namePlural})" :hint="$t('transactionAmountHint')" outlined required>
          <template v-slot:append>
            <span class="text-h6 text-onsurface-m">{{myAccount.currency.attributes.symbol}}</span>
          </template>
        </q-input>
        <q-btn :label="$t('charge')" color="primary" unelevated @click="onSubmit"></q-btn>
      </div>
    </q-page>
  </q-page-container>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import PageHeader from "../../layouts/PageHeader.vue";
import { useStore } from "vuex";
import SelectMember from "../../components/SelectMember.vue";

export default defineComponent({
  components: {
    PageHeader,
    SelectMember
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
  setup() {
    const step = ref("form")
    const form = computed(() => (step.value == "form"))
    const confirm = computed(() => (step.value == "confirm"))
    
    const onSubmit = () => {
      step.value = "confirm"
    }

    const member = ref()
    const concept = ref('')
    const amount = ref('')
    const store = useStore()

    return {
      form,
      member,
      concept,
      amount,
      myAccount: store.getters.myAccount,
      onSubmit
    }
  }
})
</script>