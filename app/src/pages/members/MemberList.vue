<template>
  <div>
    <page-header
      search
      :title="$t('members')"
      balance
      @search="search"
    />
    <q-page-container>
      <q-page>
        <div 
          class="text-overline text-uppercase text-onsurface-d q-pt-md q-px-md row justify-between"
        >
          <div>
            {{ $t('account') }}
          </div>
          <div class="text-right">
            {{ $t('balance') }}
          </div>
        </div>
          
        <resource-cards
          ref="memberItems"
          v-slot="slotProps"
          :code="code"
          module-name="members"
          include="contacts,account"
        >
          <q-list
            v-if="slotProps.resources"
            padding
          >
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
                      FormatCurrency(
                        member.account.attributes.balance,
                        member.account.currency
                      )
                    }}
                  </div>
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
import { defineComponent } from "vue";
import FormatCurrency from "../../plugins/FormatCurrency";

import PageHeader from "../../layouts/PageHeader.vue";

import ResourceCards from "../ResourceCards.vue";

import MemberHeader from "../../components/MemberHeader.vue";


export default defineComponent({
  name: "MemberList",
  components: {
    MemberHeader,
    ResourceCards,
    PageHeader,
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  setup() {
    return { FormatCurrency }
  },
  methods: {
    search(query: string) {
      (this.$refs.memberItems as {fetchResources: (s: string) => void}).fetchResources(query);
    }
  }
});
</script>
