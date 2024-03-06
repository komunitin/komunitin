<template>
  <div>
    <page-header
      :title="$t('transactions')" 
      search 
      balance
      @search="search" 
    />
    <q-page-container>
      <q-page>
        <transaction-items
          ref="transactionItems"
          :code="code"
          :member="myMember" 
        />
        <create-transaction-btn />
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

import PageHeader from "../../layouts/PageHeader.vue";
import CreateTransactionBtn from "../../components/CreateTransactionBtn.vue";
import TransactionItems from "./TransactionItems.vue";

export default defineComponent({
  name: "MemberList",
  components: {
    PageHeader,
    TransactionItems,
    CreateTransactionBtn,
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
      (this.$refs.transactionItems as { fetchResources: (s: string) => void }).fetchResources(query);
    }
  }
});
</script>
