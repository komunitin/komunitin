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
        :label="$t('amountIn', {currency: currency.attributes.namePlural})"
        :hint="$t('transactionAmountHint')"
        outlined
        required
        :rules="[
          () => !v$.amount.$invalid || $t('invalidAmount'),
        ]"
      >
        <template #append>
          <span class="text-h6 text-onsurface-m">{{ currency.attributes.symbol }}</span>
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
import { ref, computed } from "vue"
import { useVuelidate } from "@vuelidate/core"
import { minValue, numeric, required } from "@vuelidate/validators"
import { Member, Account, Currency, Transfer } from "src/store/model"
import KError, { KErrorCode } from "src/KError"
import { v4 as uuid } from "uuid"
import { DeepPartial } from "quasar"
import SelectMember from "src/components/SelectMember.vue"

const props = defineProps<{
  modelValue: DeepPartial<Transfer> | undefined,
  code: string,
  selectPayer: boolean,
  payerMember?: Member & {account: Account},
  selectPayee: boolean,
  payeeMember?: Member & {account: Account},
  currency: Currency,
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

const payerMember = ref<Member & {account: Account} | undefined>(props.payerMember)
const payeeMember = ref<Member & {account: Account} | undefined>(props.payeeMember)
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

const onSubmit = () => {
  if (!payerMember.value?.account || !payeeMember.value?.account) {
    throw new KError(KErrorCode.ScriptError, "Both payer and payee must be defined before submit.")
  }
  // Build transfer object
  transfer.value = {
    id: uuid(),
    type: "transfers",
    attributes: {
      amount: (amount.value as number) * Math.pow(10, props.currency.attributes.scale),
      meta: concept.value,
      state: "new",
      created: new Date().toUTCString(),
      updated: new Date().toUTCString(),
    },
    relationships: {
      payer: {data: {type: "accounts", id: payerMember.value.account.id}},
      payee: {data: {type: "accounts", id: payeeMember.value.account.id}},
      currency: {data: {type: "currencies", id: props.currency.id}}
    }
  };
}

</script>