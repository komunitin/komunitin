<template>
  <resource-card-list
    ref="resource-list"
    v-slot="slotProps"
    :code="code"
    :title="$t('transactions')"
    module-name="transactions"
    include="currency,transfers,transfers.payer,transfers.payer.member,transfers.payee,transfers.payee.member"
  >
    <q-list v-if="slotProps.resources" padding>
      <member-header
        v-for="transaction of transactions"
        :key="transaction.id"
        :member="otherMember(transaction)"
        clickable
        :class="transaction.attributes.state"
      >
        <template #caption>
          {{ transfer(transaction).attributes.meta }}
        </template>
        <template #side>
          <div class="column items-end">
            <q-item-label caption class="col">
              <span v-if="transaction.attributes.state == 'pending'">
                {{ $t("pendingAcceptance") }}
              </span>
              <span v-else>
                {{ transaction.attributes.updated | date }}
              </span>
            </q-item-label>
            <div
              class="col currency text-h6"
              :class="currencyClass(transaction)"
            >
              {{
                $currency(
                  transfer(transaction).attributes.amount,
                  transaction.currency
                )
              }}
            </div>
          </div>
        </template>
      </member-header>
    </q-list>
  </resource-card-list>
</template>
<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import MemberHeader from "../../components/MemberHeader.vue";
import FormatCurrency from "../../plugins/FormatCurrency";
import ResourceCardList from "../ResourceCardList.vue";
import { Transaction, Transfer, Member } from "../../store/model";

Vue.use(FormatCurrency);

interface ExtendedTransaction extends Transaction {
  transfers: ExtendedTransfer[];
}
interface ExtendedTransfer extends Transfer {
  payer: ExtendedAccount;
  payee: ExtendedAccount;
}
interface ExtendedAccount extends Account {
  member: Member;
}

export default Vue.extend({
  name: "MemberList",
  components: {
    MemberHeader,
    ResourceCardList
  },
  props: {
    code: {
      type: String,
      required: true
    },
    accountCode: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters(["myAccount"])
  },
  methods: {
    transfer(transaction: ExtendedTransaction): ExtendedTransfer {
      return transaction.transfers[0];
    },
    otherMember(transaction: ExtendedTransaction): Member {
      const payer = this.transfer(transaction).payer;
      const payee = this.transfer(transaction).payee;
      const other = this.myAccount == payer ? payee : payer;
      return other.member;
    },
    currencyClass(transaction: ExtendedTransaction): string {
      return (this.transfer(transaction).attributes.amount >= 0) ? "positive" : "negative"; 
    }
  }
});
</script>
<style lang="scss" scoped>
.currency.positive {
  color: $primary;
}
.currency.negative {
  color: $kblue;
}
</style>
