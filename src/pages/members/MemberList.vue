<template>
  <div>
    <page-header search :title="$t('members')" balance @search="search" />
    <q-page-container>
      <q-page>
        <resource-cards
          ref="memberItems"
          v-slot="slotProps"
          :code="code"
          module-name="members"
          include="contacts,account"
        >
          <q-list v-if="slotProps.resources" padding>
            <member-header
              v-for="member of slotProps.resources"
              :key="member.id"
              :member="member"
              :to="`/groups/${code}/members/${member.attributes.code}`"
            >
              <template #side>
                <div class="column items-end">
                  <div
                    class="col currency text-h6"
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
                  </div>
                  <q-item-label caption class="col"><account-limits :account="member.account"/></q-item-label>
                </div>
              </template>
            </member-header>
          </q-list>
        </resource-cards>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import PageHeader from "../../layouts/PageHeader.vue";
import MemberHeader from "../../components/MemberHeader.vue";
import FormatCurrency from "../../plugins/FormatCurrency";
import ResourceCards from "../ResourceCards.vue";
import AccountLimits from "./AccountLimits.vue";

Vue.use(FormatCurrency);

export default Vue.extend({
  name: "MemberList",
  components: {
    MemberHeader,
    ResourceCards,
    PageHeader,
    AccountLimits
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  methods: {
    search(query: string) {
      (this.$refs.memberItems as Vue & {fetchResources: (s: string) => void}).fetchResources(query);
    }
  }
});
</script>
