<template>
  <resource-card-list
    v-if="myAccount"
    v-slot="slotProps"
    :code="code"
    :title="$t('transactions')"
    module-name="transactions"
    include="currency,transfers,transfers.payer,transfers.payee"
    sort="-updated"
    :filter="{ account: myAccount.id }"
    :autoload="autoload"
    @afterLoad="fetchMembers"
  >
    <q-list v-if="slotProps.resources" padding>
        <member-header
          v-for="transaction of loadedTransactions(slotProps.resources)"
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
                  {{ $t("pending") }}
                </span>
                <span v-else>
                  {{ transaction.attributes.updated | date }}
                </span>
              </q-item-label>
              <div
                class="col currency text-h6"
                :class="signedAmount(transaction) >= 0 ? 'positive' : 'negative'"
              >
                {{ $currency(signedAmount(transaction), transaction.currency) }}
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

    /** Not really used by now, as we suppose this is the current logged-in account. */
    memberCode: {
      type: String,
      required: true
    }
  },
  data: () => ({
    /**
     * A dictionary transaction id => true, for transactions such that the
     * related member is aleready laoded.
     * 
     * See hasMember() method for further details.
     */
    transactionLoaded: {} as Record<string, boolean>,
    /**
     * Whether to activate the autoloading feature of ResourceCardList.
     * 
     * We use this variable to disable autoloading while fetching transaction members.
     */
    autoload: true,
  }),
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
      // We can't directly compare object references because they're not the same.
      const other = this.myAccount.id == payer.id ? payee : payer;
      return other.member;
    },
    signedAmount(transaction: ExtendedTransaction): number {
      const transfer = this.transfer(transaction);
      return transfer.payer.id == this.myAccount.id
        ? -transfer.attributes.amount
        : transfer.attributes.amount;
    },
    /**
     * Fetch the member objects associated to the just loaded transactions.
     * 
     * Note that members can't be loaded using the regular inclusion pattern of JSON:API 
     * because the relationship account=>member is inverse.
     */
    async fetchMembers() {
      this.autoload = false;
      const transactions = this.$store.getters["transactions/currentList"];
      const accountIds = new Set<string>();
      transactions
        .map((transaction: ExtendedTransaction) => this.transfer(transaction))
        .forEach((transfer: ExtendedTransfer) => {
          accountIds.add(transfer.payer.id);
          accountIds.add(transfer.payee.id);
        });
      await this.$store.dispatch("members/loadList", {
        group: this.code,
        filter: {
          account: Array.from(accountIds).join(",")
        }
      });
      transactions.forEach((transaction: ExtendedTransaction) => {
        this.transactionLoaded[transaction.id] = true
      });
      this.autoload = true;
    },
    /**
     * Filter the transaction list to those that are fully loaded.
     * 
     * Use this function instead of `transaction.payer.member !== null` since the latter 
     * is not reactive. Indeed, the link to associated resources are provided through 
     * lazy getters, so there are not "plain data" and hence can't be handled by the
     * reactive library. This function, instead, uses the plain dictionary this.transactionLoaded
     * which does have the reactive properties.
     */
    loadedTransactions(transactions: ExtendedTransaction[]): ExtendedTransaction[] {
      const loaded = transactions.filter(transaction => this.transactionLoaded[transaction.id]);
      loaded.forEach(transaction => {
        if (this.transfer(transaction).payer.member == null) {
          console.error("Invalid payer state!");
        }
        if (this.transfer(transaction).payee.member == null) {
          console.log("Invalid payee state!");
        }
      })
      return loaded;
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
