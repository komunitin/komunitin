<template>
  <resource-cards
    v-if="account"
    ref="resourceCards"
    v-slot="slotProps"
    :code="code"
    module-name="transfers"
    include="payer,payee,payee.currency"
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
        <transaction-item 
          :transfer="transfer"
          :code="code"
          :account="account"
          :clickable="false"
        />
      </template>
      <q-separator />
    </q-list>
  </resource-cards>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import ResourceCards from "../ResourceCards.vue";
import TransactionItem from "src/components/TransactionItem.vue";

import { ExtendedTransfer, Account, Currency } from "../../store/model";
import { LoadListPayload } from "src/store/resources";

export default defineComponent({
  name:"TransactionItems",
  components: {
    ResourceCards,
    TransactionItem
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
     * related member is aleready loaded.
     */
    transferLoaded: {} as Record<string, boolean>,
  }),
  computed: {
    account() : Account & {currency: Currency} {
      return this.member.account;
    },
  },
  methods: {
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
      return transfers.filter(transfer => this.transferLoaded[transfer.id] || (
        (transfer.payer?.member || transfer.relationships.payer.data.meta?.external && transfer.payer) 
        && 
        (transfer.payee?.member || transfer.relationships.payee.data.meta?.external && transfer.payee)
      ))
    },
    fetchResources(search: string): void {
      (this.$refs.resourceCards as {fetchResources: (s: string) => void}).fetchResources(search);
    }
  },
})
</script>
