<template>
  <page-header 
    :title="title" 
    balance 
    :back="`/groups/${code}/members/${myMemberCode}/transactions`"
  />
  <q-page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <create-transaction-form 
        v-if="state !== 'loading'"
        v-show="state === 'define'"
        :code="code"
        :select-payer="selectPayer"
        :payer-account="payerAccount"
        :select-payee="selectPayee"
        :payee-account="payeeAccount"
        :currency="currency"
        :text="text"
        :submit-label="submitLabel"
        :model-value="transfer"
        @update:model-value="onFilled"
      />
      <confirm-create-transaction 
        v-if="state === 'confirm'"
        :code="code"
        :transfer="transfer"
        @back="state = 'define'"
      />
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import {computed, ref, watchEffect } from "vue"
import { useStore } from "vuex"
import PageHeader from "../../layouts/PageHeader.vue"
import { Account, Currency, Member, Transfer } from "../../store/model"
import { useI18n } from "vue-i18n"
import CreateTransactionForm from "./CreateTransactionForm.vue"
import ConfirmCreateTransaction from "./ConfirmCreateTransaction.vue"
import { DeepPartial } from "quasar"

const props = defineProps<{
  /**
   * Group code
   */
  code: string,
  /**
   * Whether the payer is configurable. 
   * If false, the payer needs to be provided or defauls to the current member.
   */
  selectPayer: boolean,
  /**
   * Payer member code. Mandatory if selectPayer is false.
   */
  payerMemberCode?: string,
  /**
   * Whether the payee is configurable.
   * If false, the payee needs to be provided or defaults to the current member.
   */
  selectPayee: boolean
  /**
   * Payee member code. Mandatory if selectPayee is false.
   */
  payeeMemberCode?: string
}>()

// Store
const store = useStore()
const { t } = useI18n()

const myAccount = computed<Account & {currency: Currency, member: Member}>(() => store.getters.myAccount)
const myMember = computed<Member & {account: Account}>(() => store.getters.myMember)
const myMemberCode = computed<string>(() => myMember.value.attributes.code)
const currency = computed<Currency>(() => myAccount.value.currency);


const direction = computed(() => {
  if (!props.selectPayer && props.selectPayee) {
    return "payment"
  } else if (props.selectPayer && !props.selectPayee) {
    return "paymentRequest"
  } else {
    return "transfer"
  }
})

const title = computed(() => {
  switch (direction.value) {
    case "payment":
      return t("sendPayment")
    case "paymentRequest":
      return t("receivePayment")
    default:
      return t("createTransaction")
  }
})

const text = computed(() => {
  switch (direction.value) {
    case "payment":
      return t("sendPaymentText")
    case "paymentRequest":
      return t("receivePaymentText")
    default:
      return t("createTransactionText")
  }
})

const submitLabel = computed(() => {
  switch (direction.value) {
    case "payment":
      return t("sendPayment")
    case "paymentRequest":
      return t("receivePayment")
    default:
      return t("submitTransaction")
  }
})

const loadAccount = (isSelect: boolean, memberCode?: string) => {
  const account = ref<Account & {member: Member}>()
  if (memberCode) {
    store.dispatch("members/load", {
      group: props.code, 
      code: memberCode, 
      include: "account,group"
    }).then(() => {
      account.value = store.getters["members/current"].account
    })
  } else if (!isSelect) {
    account.value = myAccount.value
  }
  return account
}

const payerAccount = loadAccount(props.selectPayer, props.payerMemberCode)
const payeeAccount = loadAccount(props.selectPayee, props.payeeMemberCode)

// Transfer model
const transfer = ref<DeepPartial<Transfer>>()
const state = ref<"loading"|"define"|"confirm">("loading")

watchEffect(() => {
  if (state.value === "loading"
    && (props.selectPayer || payerAccount.value)
    && (props.selectPayee || payeeAccount.value)) {
    state.value = "define"
  }
})

const onFilled = (value: DeepPartial<Transfer>) => {
  // This operation is not the same as just doing transfer.value = value,
  // because the store adds some attributes to the transfer (such as transfer.payer, etc).
  store.dispatch("transfers/setCurrent", value)
  transfer.value = store.getters["transfers/current"]
  
  state.value = "confirm"
}

</script>