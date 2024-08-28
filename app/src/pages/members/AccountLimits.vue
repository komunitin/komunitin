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
import { defineComponent } from "vue"
import FormatCurrency from "../../plugins/FormatCurrency"
export default defineComponent({
  name: "AccountLimits",
  props: {
    account: {
      type: Object,
      required: true,
    }
  },
  computed: {
    isMinAmount() : boolean {
      return this.account.attributes.maximumBalance >= 0;
    },
    isMaxAmount() : boolean {
      return this.account.attributes.creditLimit >= 0;
    },
    minAmount(): string {
      return this.$t("minAmount", {
        amount: FormatCurrency(-this.account.attributes.maximumBalance, this.account.currency, {
          decimals: false
        })
      }) as string;
    },
    maxAmount(): string {
      return this.$t("maxAmount", {
        amount: FormatCurrency(this.account.attributes.creditLimit, this.account.currency, {
          decimals: false
        })
      }) as string;
    }
  }
})
</script>