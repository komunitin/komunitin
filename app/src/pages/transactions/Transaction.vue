<template>
  <div>
    <page-header 
      :title="$t('transaction')"
      :back="`/groups/${code}/members/${myMember.attributes.code}/transactions`"
      balance
    />
    <q-page-container 
      class="row justify-center bg-light"
    >
      <q-page
        v-if="!isLoading"
        padding
        class="q-py-lg col-12 col-sm-8 col-md-6"
      >
        <transaction-card :transfer="transfer" >
          <div v-if="isPending">
            <q-separator />
            <q-card-actions class="justify-end">
              <q-btn 
                :label="$t('Reject')"
                color="primary"
                flat
                padding="xs lg"
                @click="reject"
              />
              <q-btn
                :label="$t('Accept')"
                type="submit"
                color="primary"
                padding="xs lg"
                unelevated
                @click="accept"
              />
            </q-card-actions>  
          </div>
        </transaction-card>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapGetters } from "vuex";
import PageHeader from "../../layouts/PageHeader.vue";
import {ExtendedTransfer} from "../../store/model";
import FormatCurrency from "../../plugins/FormatCurrency"
import TransactionCard from "../../components/TransactionCard.vue"
import KError, { KErrorCode } from "src/KError";

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
    const ready = ref(false)
    const accept = () => { throw new KError(KErrorCode.NotImplemented)}
    const reject = () => { throw new KError(KErrorCode.NotImplemented)}
    return { FormatCurrency, ready, accept, reject}
  },
  computed: {
    ...mapGetters(["myAccount","myMember"]),
    transfer(): ExtendedTransfer {
      return this.$store.getters["transfers/current"];
    },
    isLoading(): boolean {
      // Use explicit ready to force update.
      return !(this.ready || this.transfer && this.transfer.payee.member && this.transfer.payer.member)
    },
    isPending(): boolean {
      return this.transfer?.attributes.state == 'pending'
    }

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
      })
      // fetch account members in a separate call, since the relation
      // account => member does not exist, only the member => account relation.
      await this.$store.dispatch("members/loadList", {
        group: this.code,
        filter: {
          account: this.transfer.payee.id + "," + this.transfer.payer.id
        },
        onlyResources: true
      })
      this.ready = true
    }
  }
})
</script>