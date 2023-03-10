<template>
  <div>
    <page-header 
      :title="$t('transaction')"
      back
      balance
    />
    <q-page-container 
      class="row justify-center bg-light"
    >
      <q-page
        v-if="ready"
        padding
        class="q-py-lg col-12 col-sm-8 col-md-6"
      >
        <transaction-card :transfer="transfer" />
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import PageHeader from "../../layouts/PageHeader.vue";
import {ExtendedTransfer} from "../../store/model";
import FormatCurrency from "../../plugins/FormatCurrency"
import TransactionCard from "../../components/TransactionCard.vue"

export default defineComponent({
  components: {
    PageHeader,
    TransactionCard
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    transferCode: {
      type: String,
      required: true
    }
  },
  setup() {
    return { FormatCurrency }
  },
  data: () => ({
    // We need to explicitely warn Vue on when the data is ready since the dependencies 
    // of the fetched (transfer.payer.member) object are not reactive.
    ready: false
  }),
  computed: {
    ...mapGetters(["myAccount"]),
    transfer(): ExtendedTransfer {
      return this.$store.getters["transfers/current"];
    },
  },
  created() {
    // See comment in analogous function at Group.vue.
    this.$watch("transferCode", this.fetchData, { immediate: true });
  },
  methods: {
    async fetchData(transferCode: string) {
      // fetch transfer and accounts.
      await this.$store.dispatch("transfers/load", {
        code: transferCode,
        group: this.code,
        include: "payer,payee,currency"
      });
      // fetch account members in a separate call, since the relation
      // account => member does not exist, only the member => account relation.
      await this.$store.dispatch("members/loadList", {
        group: this.code,
        filter: {
          account: this.transfer.payee.id + "," + this.transfer.payer.id
        }
      })
      this.ready = true;
    }
  }
})
</script>