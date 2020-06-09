<template>
  <resource-card-list
    v-slot="slotProps"
    :code="code"
    :title="$t('members')"
    module-name="members"
    include="contacts,account"
  >
    <q-list v-if="slotProps.resources" padding>
      <member-header
        v-for="member of slotProps.resources"
        :key="member.id"
        :member="member"
        clickable
      >
        <template #side>
          <div class="column items-end">
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
  </resource-card-list>
</template>
<script lang="ts">
import Vue from "vue";
import MemberHeader from "../../components/MemberHeader.vue";
import FormatCurrency from "../../plugins/FormatCurrency";
import ResourceCardList from "../ResourceCardList.vue";

Vue.use(FormatCurrency);

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
    }
  },
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
