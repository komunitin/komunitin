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
    @page-loaded="fetchMembers"
  >
    <q-list
      v-if="slotProps.resources"
      padding
    >
      <template 
        v-for="transfer of loadedTransfers(slotProps.resources)"
        :key="transfer.id"
      >
        <q-separator />
        <member-header
          :member="otherMember(transfer)"
          clickable
          :class="transfer.attributes.state"
          :to="`/groups/${code}/transactions/${transfer.id}`"
        >
          <template #extra>
            <q-item-section>
              <q-item-label lines="2">
                {{ transfer.attributes.meta }}
              </q-item-label>
            </q-item-section>
          </template>
          <template #side>
            <div class="column items-end">
              <q-item-label
                caption
                class="col top-right-label"
              >
                <span v-if="transfer.attributes.state == 'pending'">
                  {{ $t("pending") }}
                </span>
                <span v-else>
                  {{ $formatDate(transfer.attributes.updated) }}
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
                {{ FormatCurrency(signedAmount(transfer), transfer.currency) }}
              </div>
            </div>
          </template>
        </member-header>
      </template>
      <q-separator />
    </q-list>
  </resource-cards>
</template>
<script lang="ts">
import { defineComponent } from "vue"

import FormatCurrency from "../../plugins/FormatCurrency";

import ResourceCards from "../ResourceCards.vue";
import MemberHeader from "../../components/MemberHeader.vue";

import { ExtendedTransfer, Member, Account } from "../../store/model";
import { LoadListPayload } from "src/store/resources";

export default defineComponent({
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
  setup() {
    return { FormatCurrency }
  },
  data: () => ({
    /**
     * A dictionary transfer id => true, for transfers such that the
     * related member is aleready loaded.
     */
    transferLoaded: {} as Record<string, boolean>,
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
    async fetchMembers(page: number) {
      const transfers = this.$store.getters["transfers/page"](page);
      const accountIds = new Set<string>();
      transfers
        .forEach((transfer: ExtendedTransfer) => {
          [transfer.payer.id, transfer.payee.id].forEach(id => {
            if (id !== this.account.id) {
              accountIds.add(id);
            }
          })
        });
      await this.$store.dispatch("members/loadList", {
        group: this.code,
        filter: {
          account: Array.from(accountIds).join(",")
        },
        onlyResources: true
      } as LoadListPayload);
      transfers.forEach((transfer: ExtendedTransfer) => {
        this.transferLoaded[transfer.id] = true
      });
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
      return transfers.filter(transfer => this.transferLoaded[transfer.id] || (transfer.payer.member && transfer.payee.member));
    },
    fetchResources(search: string): void {
      (this.$refs.resourceCards as {fetchResources: (s: string) => void}).fetchResources(search);
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
  .pending {
    background-color: $light-error;
    .top-right-label{
      color: $error;
    }
  }
</style>
