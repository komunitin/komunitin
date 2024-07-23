<template>
  <q-form @submit="onSubmit">
    <div class="q-gutter-y-lg column">  
      <div>
        <div class="text-subtitle1">
          {{ $t('enterTransactionData') }}
        </div>
        <div class="text-onsurface-m">
          {{ text }}
        </div>
      </div>
      <select-account
        v-if="selectPayer"
        v-model="payerAccount"  
        name="payer"
        :code="code"
        :payer="true"
        :label="$t('selectPayer')"
        :hint="$t('transactionPayerHint')"
        :rules="[() => !v$.payerAccount?.$error || $t('payerRequired')]"
        @close-dialog="v$.payerAccount?.$touch()"
      />
      <select-account
        v-if="selectPayee"
        v-model="payeeAccount"  
        name="payee"
        :code="code"
        :payer="false"
        :label="$t('selectPayee')"
        :hint="$t('transactionPayeeHint')"
        :rules="[() => !v$.payeeAccount?.$error || $t('payeeRequired')]"
        @close-dialog="v$.payeeAccount?.$touch()"
      />
      <q-input 
        v-model="concept"
        name="description"  
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
        name="amount"
        :label="$t('amountIn', {currency: myCurrency.attributes.namePlural})"
        :hint="$t('transactionAmountHint')"
        outlined
        required
        :rules="[
          () => !v$.amount.$invalid || $t('invalidAmount'),
        ]"
      >
        <template #append>
          <span class="text-h6 text-onsurface-m">{{ myCurrency.attributes.symbol }}</span>
        </template>
      </q-input>
      <q-input
        v-if="otherCurrency"
        :model-value="otherAmount"
        readonly
        disabled
        outlined
        :label="$t('amountIn', {currency: otherCurrency.attributes.namePlural})"
      >
        <template #append>
          <span class="text-h6 text-onsurface-m">{{ otherCurrency.attributes.symbol }}</span>
        </template>
      </q-input>
      <q-btn
        :label="submitLabel"
        type="submit"
        color="primary"
        :disabled="v$.$invalid"
        unelevated
      />
    </div>
  </q-form>
</template>
<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { minValue, numeric, required } from "@vuelidate/validators"
import { DeepPartial } from "quasar"
import KError, { KErrorCode } from "src/KError"
import SelectAccount from "src/components/SelectAccount.vue"
import formatCurrency, { convertCurrency } from "src/plugins/FormatCurrency"
import { Account, Currency, Member, Transfer, RelatedResource } from "src/store/model"
import { v4 as uuid } from "uuid"
import { computed, ref } from "vue"
import { useStore } from "vuex"

const props = defineProps<{
  modelValue: DeepPartial<Transfer> | undefined,
  code: string,
  selectPayer: boolean,
  payerAccount?: Account & {currency: Currency, member?: Member},
  selectPayee: boolean,
  payeeAccount?: Account & {currency: Currency, member?: Member},
  text: string,
  submitLabel: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', transfer: DeepPartial<Transfer>): void
}>()

const transfer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value as DeepPartial<Transfer>)
})

const payerAccount = ref(props.payerAccount)
const payeeAccount = ref(props.payeeAccount)
const concept = ref("")
const amount = ref<number>()

// Validation.
const isAccount = (member: Account|undefined) => (member && member.id !== undefined)

const rules = computed(() => ({
  ...(props.selectPayer && {payerAccount: {isAccount}}),
  ...(props.selectPayee && {payeeAccount: {isAccount}}),
  concept: { required },
  amount: { required, numeric, nonNegative: minValue(0)}
}))

const v$ = useVuelidate(rules, {
  ...(props.selectPayer && {payerAccount}),
  ...(props.selectPayee && {payeeAccount}),
  concept, 
  amount
});

const store = useStore()
const myCurrency = computed(() => store.getters.myAccount.currency)

const otherCurrency = computed(() =>  {
  if (props.selectPayer && payerAccount.value && payerAccount.value.currency.id !== myCurrency.value.id) {
    return payerAccount.value.currency
  } else if (props.selectPayee && payeeAccount.value && payeeAccount.value.currency.id !== myCurrency.value.id) {
    return payeeAccount.value.currency
  }
  return null
})

const otherAmount = computed(() => {
  if (otherCurrency.value && amount.value) {
    const num = convertCurrency(amount.value, myCurrency.value, otherCurrency.value)
    return formatCurrency(num, otherCurrency.value, {symbol: false, scale: false})
  } else {
    return null
  }
})

const onSubmit = () => {
  if (!payerAccount.value || !payeeAccount.value) {
    throw new KError(KErrorCode.ScriptError, "Both payer and payee must be defined before submit.")
  }
  if (amount.value === undefined) {
    throw new KError(KErrorCode.ScriptError, "Amount must be defined before submit.")
  }

  const transferAmount = amount.value * Math.pow(10, myCurrency.value.attributes.scale)

  const accountRelationship = (account: Account & {currency: Currency}) => {
    const relationship = {data: {type: "accounts", id: account.id}} as RelatedResource
    if (account.currency.id !== myCurrency.value.id) {
      relationship.data.meta = {
        external: true,
        href: account.links.self
      }
    }
    return relationship
  }

  // Build transfer object
  transfer.value = {
    id: uuid(),
    type: "transfers",
    attributes: {
      amount: transferAmount,
      meta: concept.value,
      state: "new",
      created: new Date().toUTCString(),
      updated: new Date().toUTCString(),
    },
    relationships: {
      payer: accountRelationship(payerAccount.value),
      payee: accountRelationship(payeeAccount.value),
    }
  };
}

</script>