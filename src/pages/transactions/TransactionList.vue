<template>
  <div>
    <page-header search :title="$t('transactions')" balance @search="search" />
    <q-page-container>
      <q-page>
        <transaction-items ref="transactionItems" :code="code" :member="myMember"/>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

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
  },
  computed: {
    ...mapGetters(["myMember"])
  },
  methods: {
    search(query: string) {
      (this.$refs.transactionItems as Vue & {fetchResources: (s: string) => void}).fetchResources(query);
    }
  }
});
</script>
