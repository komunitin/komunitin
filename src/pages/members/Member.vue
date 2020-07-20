<template>
  <div v-if="member">
    <page-header :title="member.attributes.name">
      <template #buttons>
        <contact-button icon="message" round flat :contacts="member.contacts" />
        <share-button
          icon="share"
          flat
          round
          :text="
            $t('shareMember', {
              member: member.attributes.name,
              bio: member.attributes.bio
            })
          "
          :title="member.attributes.name"
        />
      </template>
    </page-header>
    <q-page-container>
      <q-page>
        <member-page-header :member="member" :tab="tab" @tabChange="tab = $event"/>
        <q-tab-panels v-model="tab">
          <q-tab-panel name="profile" keep-alive>
            <member-profile :member="member"/>
          </q-tab-panel>
          <q-tab-panel name="needs" keep-alive>
            <member-needs :member="member" :group-code="code"/>
          </q-tab-panel>
          <q-tab-panel name="offers" keep-alive>
            <member-offers :member="member" :group-code="code"/>
          </q-tab-panel>
          <q-tab-panel name="transactions" keep-alive>
            <member-transactions :member="member" :group-code="code"/>
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import PageHeader from "../../layouts/PageHeader.vue";
import ContactButton from "../../components/ContactButton.vue";
import ShareButton from "../../components/ShareButton.vue";
import MemberPageHeader from "./MemberPageHeader.vue";
import MemberProfile from "./MemberProfile.vue";
import MemberNeeds from "./MemberNeeds.vue";
import MemberOffers from "./MemberOffers.vue";
import MemberTransactions from "./MemberTransactions.vue";
import { Member, Currency } from '../../store/model';
export default Vue.extend({
  name: "Member",
  components: {
    PageHeader,
    ContactButton,
    ShareButton,
    MemberPageHeader,
    MemberProfile,
    MemberNeeds,
    MemberOffers,
    MemberTransactions
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    memberCode: {
      type: String,
      required: true
    }
  },
  data: () => ({
    tab: "profile"
  }),
  computed: {
    member() : Member & {account: Account & {currency: Currency}} {
      return this.$store.getters['members/current'];
    }
  },
  created() {
    // See Group.vue for a comment on the following line.
    this.$watch("memberCode", this.fetchData, { immediate: true });
  },
  methods: {
    fetchData(memberCode: string) {
      return this.$store.dispatch("members/load", {
        code: memberCode,
        group: this.code,
        include: "contacts,account,account.currency,offers,needs"
      })
    },
  }
})
</script>