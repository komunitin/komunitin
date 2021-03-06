<template>
    <collapsible-header :collapsible-height="200"  :fixed-height="72">
      <div class="row q-py-lg text-onsurface-m bg-active collapsible-content">
        <div class="col-md-4 col-6 q-px-md">
          <img v-if="member.attributes.image" class="member-image q-mx-auto" :src="member.attributes.image" />
          <div v-else class="member-image q-mx-auto"><fit-text update><avatar :text="member.attributes.name" size="inherit"></avatar></fit-text></div>
        </div>
        <div class="col column">
          <div>
            <div class="text-overline text-uppercase text-onsurface-d">
              {{ memberTypeLabel }}
            </div>
            <div class="text-h6 text-onsurface">
              {{ member.account.attributes.code }}
            </div>
          </div>
          <div>
            <div class="text-overline text-uppercase text-onsurface-d q-mt-md">
              {{ $t("balance") }}
            </div>
            <div>
              <span
                class="text-h6 q-mr-md"
                :class="
                  member.account.attributes.balance >= 0
                    ? 'positive-amount'
                    : 'negative-amount'
                "
              >
                {{
                  $currency(
                    member.account.attributes.balance,
                    member.account.currency
                  )
                }}
              </span>
              <account-limits :account="member.account" class="text-body2" />
            </div>
          </div>
        </div>
      </div>
      <template #fixed>
        <q-tabs
          v-model="currentTab"
          active-bg-color="active"
          active-color="primary"
          class="bg-surface text-onsurface-m full-width"
          align="justify"
          @input="tabChange"
        >
          <q-tab name="profile" icon="account_circle" :label="$t('profile')" />
          <q-tab name="needs" icon="loyalty" :label="$tc('nNeeds', member.relationships.needs.meta.count)" />
          <q-tab name="offers" icon="local_offer" :label="$tc('nOffers', member.relationships.offers.meta.count)" />
          <q-tab
            v-if="transactions"
            name="transactions"
            icon="account_balance_wallet"
            :label="$t('transactions')"
          />
        </q-tabs>
      </template>
    </collapsible-header>
</template>
<script lang="ts">
import Vue from "vue";
import CollapsibleHeader from "../../layouts/CollapsibleHeader.vue";
import AccountLimits from "./AccountLimits.vue";
import { Member } from "../../store/model";
import Avatar from "../../components/Avatar.vue";
import FitText from "src/components/FitText.vue";

export default Vue.extend({
  name: "MemberPageHeader",
  components: {
    AccountLimits,
    CollapsibleHeader,
    Avatar,
    FitText
  },
  props: {
    member: {
      type: Object,
      required: true
    },
    tab: {
      type: String,
      required: true
    },
    /**
     * Whether to show the transactions tab.
     */
    transactions: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      currentTab: this.tab
    };
  },
  computed: {
    memberTypeLabel(): string {
      const labels: { [key: string]: string } = {
        personal: this.$t("personalAccount") as string,
        business: this.$t("businessAccount") as string,
        public: this.$t("publicAccount") as string
      };
      return labels[(this.member as Member).attributes.type];
    },
  },
  methods: {
    tabChange(value: string) {
      // Emit the custom event "tabChange" so it can be handled by parent.
      this.$emit("tabChange", value);
    }
  }
});
</script>
<style lang="scss" scoped>
// Style image:
.member-image {
  display: block;
  width: 100%;
  max-height: 152px;
  max-width: 152px;
  border-radius: 76px;
  line-height: 0;
}
.collapsible-content {
  height: 200px;
}
</style>
