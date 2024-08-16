<template>
  <q-page-sticky
    :expand="true"
    position="bottom"
    :offset="[0, 24]"
  >
    <div class="full-width row q-col-gutter-md">
      <div class="col-6 text-right">
        <q-btn
          v-if="settings.allowPaymentRequests"
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
          v-if="settings.allowPayments"
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
import { useMyAccountSettings } from 'src/composables/accountSettings'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const myMember = computed(() => store.getters.myMember)
const settings = useMyAccountSettings()

</script>