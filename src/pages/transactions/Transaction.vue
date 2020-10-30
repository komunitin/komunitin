<template>
  <div>
    <page-header :title="$t('transaction')" />
    <q-page-container class="row justify-center">
      <q-page v-if="ready" class="q-py-lg col-12 col-sm-8 col-md-6">
        <div class="q-py-sm"> <!-- payer -->
          <div class="text-overline text-uppercase text-onsurface-d q-pl-md">{{$t("payer")}}</div>
          <member-header :member="transfer.payee.member" :to="`/groups/${code}/members/${transfer.payee.member.attributes.code}`"/>
        </div>
        <q-separator />
        <div class="q-py-sm"> <!-- payee -->
          <div class="text-overline text-uppercase text-onsurface-d q-pl-md">{{$t("payee")}}</div>
          <member-header :member="transfer.payer.member" :to="`/groups/${code}/members/${transfer.payer.member.attributes.code}`"/>
        </div>
        <q-separator />
        <div class="text-center q-py-lg"><!-- main section -->
          <div class="text-h4" :class="positive ? 'positive-amount' : 'negative-amount'">
            {{ $currency((positive ? 1 : -1) * transfer.attributes.amount, transfer.currency) }}
          </div>
          <div class="text-subtitle1 text-onsurface-d">{{ transfer.attributes.updated | date }}</div>
          <div class="text-body1">{{ transfer.attributes.meta }}</div>
        </div>
        <q-separator />
        <div class="text-body2 q-pa-md"><!-- details -->
          <div><span class="text-onsurface-d">{{ $t("state") }}</span><span class="q-pl-sm">{{ state }}</span></div>
          <div><span class="text-onsurface-d">{{ $t("group") }}</span><span class="q-pl-sm">{{ transfer.currency.group.attributes.name }}</span></div>
        </div>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import KError, {KErrorCode} from "../../KError";
import { mapGetters } from "vuex";
import PageHeader from "../../layouts/PageHeader.vue";
import MemberHeader from "../../components/MemberHeader.vue";
import {Transfer, Account} from "../../store/model";

export default Vue.extend({
  components: {
    PageHeader,
    MemberHeader
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
  data: () => ({
    // We need to explicitely warn Vue on when the data is ready since the dependencies 
    // of the fetched (transfer.payer.member) object are not reactive.
    ready: false
  }),
  computed: {
    ...mapGetters(["myAccount"]),
    transfer(): Transfer & {payer: Account, payee: Account} {
      return this.$store.getters["transfers/current"];
    },
    state(): string {
      const state = this.transfer.attributes.state;
      switch(state) {
        case "new":
          return this.$t("new").toString();
        case "pending":
          return this.$t("pending").toString();
        case "accepted":
          return this.$t("accepted").toString();
        case "committed":
          return this.$t("committed").toString();
        case "rejected":
          return this.$t("rejected").toString();
        case "deleted":
          return this.$t("deleted").toString();
      }
      throw new KError(KErrorCode.InvalidTransferState);
    },
    positive(): boolean {
      // Note that when the current account is neither the payer nor the payee,
      // the amount is considered as positive.
      return this.transfer.payer.id != this.myAccount.id;
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