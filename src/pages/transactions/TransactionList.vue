<template>
  <resource-card-list
    v-slot="slotProps"
    :code="code"
    :title="$t('transactions')"
    module-name="transactions"
    include="currency"
    :load-options="{filter: {
      
    }}"
  >
    <q-list v-if="slotProps.resources" padding>
      <member-header
        v-for="transaction of transactions"
        :key="transaction.id"
        :member="transaction.member"
        clickable
        :class="transaction.state"
      >
        <template #caption>
          {{transaction.meta}}
        </template>
        <template #side>
          <div class="column items-end">
            <q-item-label caption class="col">
              <span v-if="transaction.state == 'pending'">
                {{ $t("pendingAcceptance") }}
              </span>
              <span v-else>
                {{ (transaction.attributes.updated | date) }}
              </span>
            </q-item-label>
            <div
              class="col currency text-h6"
              :class="
                transaction.amount >= 0 ? 'positive' : 'negative'
              "
            >
              {{
                $currency(
                  transaction.amount,
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
  computed: {
    transactions() {
      
      return [];
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
