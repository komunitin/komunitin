<template>
  <div class="inline">
    <span v-if="isMinAmount">{{ minAmount }}</span>
    <q-separator
      v-if="isMinAmount && isMaxAmount"
      vertical
      inset
    />
    <span v-if="isMaxAmount">{{ maxAmount }}</span>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "AccountLimits",
  props: {
    account: {
      type: Object,
      required: true,
    }
  },
  computed: {
    isMinAmount() : boolean {
      return this.account.attributes.debitLimit >= 0;
    },
    isMaxAmount() : boolean {
      return this.account.attributes.creditLimit >= 0;
    },
    minAmount(): string {
      return this.$t("minAmount", {
        amount: this.$currency(-this.account.attributes.debitLimit, this.account.currency, {
          decimals: false
        })
      }) as string;
    },
    maxAmount(): string {
      return this.$t("maxAmount", {
        amount: this.$currency(this.account.attributes.creditLimit, this.account.currency, {
          decimals: false
        })
      }) as string;
    }
  }
})
</script>