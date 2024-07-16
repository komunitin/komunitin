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
      <select-member
        v-if="selectPayer"
        v-model="payerMember"  
        name="payer"
        :code="code"
        :label="$t('selectPayer')"
        :hint="$t('transactionPayerHint')"
        :rules="[() => !v$.payerMember?.$error || $t('payerRequired')]"
        @close-dialog="v$.payerMember?.$touch()"
      />
      <select-member
        v-if="selectPayee"
        v-model="payeeMember"  
        name="payee"
        :code="code"
        :label="$t('selectPayee')"
        :hint="$t('transactionPayeeHint')"
        :rules="[() => !v$.payeeMember?.$error || $t('payeeRequired')]"
        @close-dialog="v$.payeeMember?.$touch()"
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
import SelectMember from "src/components/SelectMember.vue"
import formatCurrency, { convertCurrency } from "src/plugins/FormatCurrency"
import { Account, Currency, ExternalRelatedResource, Member, Transfer } from "src/store/model"
import { v4 as uuid } from "uuid"
import { computed, ref } from "vue"
import { useStore } from "vuex"

const props = defineProps<{
  modelValue: DeepPartial<Transfer> | undefined,
  code: string,
  selectPayer: boolean,
  payerMember?: Member & {account: Account & {currency: Currency}},
  selectPayee: boolean,
  payeeMember?: Member & {account: Account & {currency: Currency}},
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

const payerMember = ref(props.payerMember)
const payeeMember = ref(props.payeeMember)
const concept = ref("")
const amount = ref<number>()

// Validation.
const isMember = (member: Member|undefined) => (member && member.id !== undefined)

const rules = computed(() => ({
  ...(props.selectPayer && {payerMember: {isMember}}),
  ...(props.selectPayee && {payeeMember: {isMember}}),
  concept: { required },
  amount: { required, numeric, nonNegative: minValue(0)}
}))

const v$ = useVuelidate(rules, {
  ...(props.selectPayer && {payerMember}),
  ...(props.selectPayee && {payeeMember}),
  concept, 
  amount
});

const store = useStore()
const myCurrency = computed(() => store.getters.myAccount.currency)

const otherCurrency = computed(() =>  {
  if (props.selectPayer && payerMember.value && payerMember.value.account.currency.id !== myCurrency.value.id) {
    return payerMember.value?.account.currency
  } else if (props.selectPayee && payeeMember.value && payeeMember.value.account.currency.id !== myCurrency.value.id) {
    return payeeMember.value?.account.currency
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
  if (!payerMember.value?.account || !payeeMember.value?.account) {
    throw new KError(KErrorCode.ScriptError, "Both payer and payee must be defined before submit.")
  }
  if (amount.value === undefined) {
    throw new KError(KErrorCode.ScriptError, "Amount must be defined before submit.")
  }

  const transferAmount = amount.value * Math.pow(10, myCurrency.value.attributes.scale)

  const accountRelationship = (account: Account & {currency: Currency}) => {
    const relationship = {data: {type: "accounts", id: account.id}} as ExternalRelatedResource
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
      payer: accountRelationship(payerMember.value.account),
      payee: accountRelationship(payeeMember.value.account),
    }
  };
}

</script>