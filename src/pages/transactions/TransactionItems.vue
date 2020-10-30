<template>
  <resource-cards
    v-if="account"
    ref="resourceCards"
    v-slot="slotProps"
    :code="code"
    module-name="transfers"
    include="currency,payer,payee"
    sort="-updated"
    :filter="{ account: account.id }"
    :autoload="autoload"
    @afterLoad="fetchMembers"
  >
    <q-list v-if="slotProps.resources" padding>
      <member-header
        v-for="transfer of loadedTransfers(slotProps.resources)"
        :key="transfer.id"
        :member="otherMember(transfer)"
        clickable
        :class="transfer.attributes.state"
        :to="`/groups/${code}/transactions/${transfer.id}`"
      >
        <template #caption>
          {{ transfer.attributes.meta }}
        </template>
        <template #side>
          <div class="column items-end">
            <q-item-label caption class="col">
              <span v-if="transfer.attributes.state == 'pending'">
                {{ $t("pending") }}
              </span>
              <span v-else>
                {{ transfer.attributes.updated | date }}
              </span>
            </q-item-label>
            <div
              class="col transaction-amount text-h6"
              :class="
                signedAmount(transfer) >= 0
                  ? 'positive-amount'
                  : 'negative-amount'
              "
            >
              {{ $currency(signedAmount(transfer), transfer.currency) }}
            </div>
          </div>
        </template>
      </member-header>
    </q-list>
  </resource-cards>
</template>
<script lang="ts">
import Vue from "vue"

import MemberHeader from "../../components/MemberHeader.vue";
import ResourceCards from "../ResourceCards.vue";

import FormatCurrency from "../../plugins/FormatCurrency";
import { Transfer, Member, Account } from "../../store/model";

Vue.use(FormatCurrency);

interface ExtendedTransfer extends Transfer {
  payer: ExtendedAccount;
  payee: ExtendedAccount;
}
interface ExtendedAccount extends Account {
  member: Member;
}
interface ExtendedMember extends Member {
  account: Account;
}

export default Vue.extend({
  name:"TransactionItems",
  components: {
    MemberHeader,
    ResourceCards
  },
  props: {
    code: {
      type: String,
      required: true
    },

    member: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    /**
     * A dictionary transfer id => true, for transfers such that the
     * related member is aleready laoded.
     * 
     * See hasMember() method for further details.
     */
    transferLoaded: {} as Record<string, boolean>,
    /**
     * Whether to activate the autoloading feature of ResourceCardList.
     * 
     * We use this variable to disable autoloading while fetching transfer members.
     */
    autoload: true,
  }),
  computed: {
    account() : Account {
      return this.member.account;
    }
  },
  methods: {
    otherMember(transfer: ExtendedTransfer): Member {
      const payer = transfer.payer;
      const payee = transfer.payee;
      // We can't directly compare object references because they're not the same.
      const other = this.account.id == payer.id ? payee : payer;
      return other.member;
    },
    signedAmount(transfer: ExtendedTransfer): number {
      return (transfer.payer.id == this.account.id ? -1 : 1) * transfer.attributes.amount;
    },
    /**
     * Fetch the member objects associated to the just loaded transfers.
     * 
     * Note that members can't be loaded using the regular inclusion pattern of JSON:API 
     * because the relationship account=>member is inverse.
     */
    async fetchMembers() {
      this.autoload = false;
      const transfers = this.$store.getters["transfers/currentList"];
      const accountIds = new Set<string>();
      transfers
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
      transfers.forEach((transfer: ExtendedTransfer) => {
        this.transferLoaded[transfer.id] = true
      });
      this.autoload = true;
    },
    /**
     * Filter the transfer list to those that are fully loaded.
     * 
     * Use this function instead of `transfer.payer.member !== null` since the latter 
     * is not reactive. Indeed, the link to associated resources are provided through 
     * lazy getters, so there are not "plain data" and hence can't be handled by the
     * reactive library. This function, instead, uses the plain dictionary this.transferLoaded
     * which does have the reactive properties.
     */
    loadedTransfers(transfers: ExtendedTransfer[]): ExtendedTransfer[] {
      return transfers.filter(transfer => this.transferLoaded[transfer.id]);
    },
    fetchResources(search: string): void {
      (this.$refs.resourceCards as Vue & {fetchResources: (s: string) => void}).fetchResources(search);
    }
  }
})
</script>
<style lang="scss" scoped>
  /*
   * Set negative margin-top so the transaction amount so that it is 
   * inline with the transaction description and not too low.
   */
  .transaction-amount {
    margin-top: -12px;
  } 
</style>
