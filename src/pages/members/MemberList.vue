<template>
  <div>
    <page-header
      :search="true"
      :title="$t('accounts')"
      @search="fetchMembers"
    />
    <q-inner-loading :showing="isLoading" color="icon-dark" />
    <q-list v-if="!isLoading" padding>
      <member-header
        v-for="member of members"
        :key="member.id"
        :member="member"
        clickable
      >
        <template #side>
          <div v-if="member.account" class="column items-end">
            <div
              class="col currency text-h6"
              :class="
                member.account.attributes.balance >= 0 ? 'positive' : 'negative'
              "
            >
              {{
                $currency(
                  member.account.attributes.balance,
                  member.account.currency
                )
              }}
            </div>
            <q-item-label caption class="col">{{
              $t("limitAmount", {
                amount: $currency(
                  member.account.attributes.debitLimit,
                  member.account.currency,
                  { decimals: false }
                )
              })
            }}</q-item-label>
          </div>
        </template>
      </member-header>
    </q-list>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import MemberHeader from "../../components/MemberHeader.vue";
import PageHeader from "../../layouts/PageHeader.vue";
import FormatCurrency from "../../plugins/FormatCurrency";
import { Member } from "src/store/model";
import { LoadMemberListPayload } from "../../store/members";

Vue.use(FormatCurrency);

export default Vue.extend({
  name: "MemberList",
  components: {
    MemberHeader,
    PageHeader
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data: () => ({
    isLoading: true,
  }),
  computed: {
    members(): Member[] {
      return this.$store.getters["members/currentList"];
    }
  },
  created: async function() {
    await this.fetchMembers();
  },
  methods: {
    async fetchMembers(search?: string): Promise<void> {
      this.isLoading = true;
      try {
        await this.$store.dispatch("members/loadList", {
          group: this.code,
          includeAccounts: true,
          search
        } as LoadMemberListPayload);
      } finally {
        this.isLoading = false;
      }
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
