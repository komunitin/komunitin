<template>
  <page-header :title="$t('createTransaction')" />
  <q-page-container class="row justify-center">
    <q-page class="q-py-lg col-12 col-sm-8 col-md-6">
      <q-form @submit="onSubmit">
        <div class="q-gutter-y-lg column">  
          <div>
            <div class="text-subtitle1">
              {{ $t('enterTransactionData') }}
            </div>
            <div class="text-onsurface-m">
              {{ $t('transactionFormHelpText') }}
            </div>
          </div>
          <select-member
            v-model="member"
            :code="code"
            :label="$t('selectPayer')"
            :hint="$t('transactionPayerHint')"
            :rules="[() => !v$.member.$invalid || $t('payerRequired')]"
          />
          <q-input 
            v-model="concept" 
            :label="$t('description')" 
            :hint="$t('transactionDescriptionHint')" 
            outlined 
            autogrow 
            required
            :rules="[() => !v$.concept.$invalid || $t('descriptionRequired')]"
          >
            <template #append>
              <q-icon name="notes" />
            </template>
          </q-input>
          <q-input 
            v-model="amount"
            :label="$t('amountIn', {currency: myAccount.currency.attributes.namePlural})"
            :hint="$t('transactionAmountHint')"
            outlined
            required
            :rules="[
              () => !v$.amount.$invalid || $t('invalidAmount'),
            ]"
          >
            <template #append>
              <span class="text-h6 text-onsurface-m">{{ myAccount.currency.attributes.symbol }}</span>
            </template>
          </q-input>
          <q-btn
            :label="$t('charge')"
            type="submit"
            color="primary"
            unelevated
          />
        </div>
      </q-form>
    </q-page>
  </q-page-container>
</template>
<script lang="ts">
import useVuelidate from "@vuelidate/core"
import { minValue, numeric, required } from '@vuelidate/validators'
import { uniqueId } from "lodash"
import { computed, defineComponent, Ref, ref } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import SelectMember from "../../components/SelectMember.vue"
import PageHeader from "../../layouts/PageHeader.vue"
import { Member } from "../../store/model"

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
  setup(props) {
    // Store
    const store = useStore()
    const myAccount = store.getters.myAccount
    const currency = myAccount.currency;
    
    // Form state.
    const currentTransfer = store.getters["transfers/current"]
    let member: Ref, concept: Ref<string>, amount: Ref<number|undefined>;
    if (currentTransfer !== undefined && currentTransfer.attributes.state == "new") {
      member = ref(currentTransfer.payer.member)
      concept = ref(currentTransfer.attributes.meta)
      amount = ref(currentTransfer.attributes.amount / Math.pow(10, currency.attributes.scale))
    } else {
      member = ref(null)
      concept = ref('')
      amount = ref<number>()
    }
    // Validation.
    const isMember = (value: Member|undefined|null) => (value !== undefined && value != null)
    const rules = computed(() => ({
      member: { isMember },
      concept: { required },
      amount: { required, numeric, nonNegative: minValue(0)}
    }))
    const v$ = useVuelidate(rules, {member, concept, amount});
    // Router
    const router = useRouter()
    // Submit
    const onSubmit = () => {
      // Build transfer object
      const transfer = {
        id: uniqueId(),
        attributes: {
          amount: (amount.value as number) * Math.pow(10, currency.attributes.scale),
          meta: concept.value,
          state: "new",
          created: new Date().toUTCString(),
          updated: new Date().toUTCString(),
        },
        relationships: {
          payer: {data: {type: "accounts", id: member.value.account.id}},
          payee: {data: {type: "accounts", id: myAccount.id}},
          currency: {data: {type: "currencies", id: currency.id}}
        }
      };
      // Store transfer object as current store object.
      store.commit("transfers/setCurrent", transfer)
      // Go to confirm page.
      router.push({
        name: "ConfirmCreateTransaction", 
        params: props
      })
    }

    return {
      member,
      concept,
      amount,
      myAccount: store.getters.myAccount,
      v$,
      onSubmit
    }
  }
})
</script>