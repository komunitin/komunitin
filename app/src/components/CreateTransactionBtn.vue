<template>
  <q-page-sticky
    :expand="true"
    position="bottom"
    :offset="[0, 24]"
  >
    <div class="full-width row q-col-gutter-md">
      <div class="col-6 text-right">
        <q-btn
          v-if="allowPaymentRequests"
          id="request-payment"
          fab
          icon="arrow_downward"
          color="primary"
          :label="$t('receive')"
          :to="`/groups/${myMember.group.attributes.code}/members/${myMember.attributes.code}/transactions/receive`"
        />
      </div>
      <div class="col-6">
        <q-btn
          v-if="allowPayments"
          id="make-payment"
          fab
          icon="arrow_upward"
          color="primary"
          :label="$t('send')"
          :to="`/groups/${myMember.group.attributes.code}/members/${myMember.attributes.code}/transactions/send`"
        />
      </div>
    </div>
  </q-page-sticky>
</template>
<script lang="ts" setup>
import { AccountSettings, Currency } from 'src/store/model'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const myMember = computed(() => store.getters.myMember)
const myAccount = computed(() => store.getters.myAccount)

const settings = computed<AccountSettings>(() => myAccount.value.settings)
const currency = computed<Currency>(() => myAccount.value.currency)

const allowPayments = computed(() => 
  settings.value.attributes.allowPayments ?? 
  currency.value.attributes.settings.defaultAllowPayments
)
const allowPaymentRequests = computed(() => 
  settings.value.attributes.allowPaymentRequests ?? 
  currency.value.attributes.settings.defaultAllowPaymentRequests
)

</script>