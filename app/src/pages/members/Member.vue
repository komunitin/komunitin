<template>
  <div v-if="!isLoading">
    <page-header 
      :title="member.attributes.name"
      back
    >
      <template #buttons>
        <contact-button
          v-if="member.contacts"
          icon="message"
          round
          flat
          :contacts="member.contacts"
        />
        <share-button
          icon="share"
          flat
          round
          :text="
            $t('shareMember', {
              member: member.attributes.name,
              bio: member.attributes.description
            })
          "
          :title="member.attributes.name"
        />
      </template>
    </page-header>
    <q-page-container>
      <q-page>
        <member-page-header
          :member="member"
          :tab="tab"
          :transactions="!isMe"
          @tab-change="onTabChange"
        />
        <q-tab-panels v-model="tab">
          <q-tab-panel
            name="profile"
            keep-alive
          >
            <member-profile :member="member" />
          </q-tab-panel>
          <q-tab-panel
            name="needs"
            keep-alive
          >
            <member-needs
              :member="member"
              :group-code="code"
            />
          </q-tab-panel>
          <q-tab-panel
            name="offers"
            keep-alive
          >
            <member-offers
              :member="member"
              :group-code="code"
            />
          </q-tab-panel>
          <q-tab-panel
            v-if="!isMe"
            name="transactions"
            keep-alive
          >
            <transaction-items
              :code="code"
              :member="member"
            />
          </q-tab-panel>
        </q-tab-panels>
        <create-transaction-btn v-if="!isMe" />
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import {mapGetters} from "vuex";

import PageHeader from "../../layouts/PageHeader.vue";

import ContactButton from "../../components/ContactButton.vue";
import MemberNeeds from "./MemberNeeds.vue";
import MemberOffers from "./MemberOffers.vue";
import MemberPageHeader from "./MemberPageHeader.vue";
import MemberProfile from "./MemberProfile.vue";
import ShareButton from "../../components/ShareButton.vue";
import CreateTransactionBtn from "../../components/CreateTransactionBtn.vue";
import TransactionItems from "../transactions/TransactionItems.vue";

import { Member, Currency, Account, Contact, Offer, Need } from '../../store/model';

export default defineComponent({
  name: "Member",
  components: {
    PageHeader,
    ContactButton,
    ShareButton,
    MemberPageHeader,
    MemberProfile,
    MemberNeeds,
    MemberOffers,
    TransactionItems,
    CreateTransactionBtn
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
    tab: "profile",
  }),
  computed: {
    ...mapGetters(["myMember"]),
    member() : Member & {account: Account & {currency: Currency}, contacts?: Contact[], offers?: Offer[], needs?: Need[]} {
      return this.$store.getters['members/current'];
    },
    isMe() : boolean {
      return this.member && this.myMember && this.member.id == this.myMember.id;
    },
    isLoading() : boolean {
      return !(this.member && this.member.offers && this.member.needs && this.member.account && this.member.contacts);
    }
  },
  created() {
    // See Group.vue for a comment on the following line.
    this.$watch("memberCode", this.fetchData, { immediate: true });
  },
  methods: {
    async fetchData(memberCode: string) {
      //this.ready = false;
      await this.$store.dispatch("members/load", {
        code: memberCode,
        group: this.code,
        include: "contacts,offers,needs,account"
      });
      /*await this.$store.dispatch("accounts/loadList", {
        group: this.code,
        filter: {
          id: this.member.relationships.account.data.id
        },
        include: "currency"
      })*/
      //this.ready = true;
    },
    onTabChange(tab: string) {
      this.tab = tab;
    }
  }
})
</script>