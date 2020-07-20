<template>
  <div>
    <page-header search :title="$t('transactions')" balance @search="search" />
    <q-page-container>
      <q-page>
        <transaction-items ref="transactionItems" :code="code" :member-code="memberCode"/>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import PageHeader from "../../layouts/PageHeader.vue";
import TransactionItems from "./TransactionItems.vue";

export default Vue.extend({
  name: "MemberList",
  components: {
    PageHeader,
    TransactionItems
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
  methods: {
    search(query: string) {
      (this.$refs.transactionItems as Vue & {fetchResources: (s: string) => void}).fetchResources(query);
    }
  }
});
</script>
