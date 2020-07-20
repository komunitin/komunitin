<template>
  <transaction-items :code="groupCode" :member-code="member.id"/>
</template>
<script lang="ts">
import Vue from "vue";
import TransactionItems from "../transactions/TransactionItems.vue";

export default Vue.extend({
  name: "MemberTransactions",
  components: {
    TransactionItems
  },
  props: {
    groupCode: {
      type: String,
      required: true
    },
    member: {
      type: Object,
      required: true
    }
  }
});
</script>
