<template>
  <div>
    <q-toolbar class="bg-primary text-onprimary">
      <q-btn
        id="back"
        flat
        round
        icon="arrow_back"
        :aria-label="$t('Back')"
        @click="$router.back()"
      />
      <q-toolbar-title>{{group ? group.attributes.name : ""}}</q-toolbar-title>

      <q-btn v-if="group" right flat round icon="message" @click="contactsView = true" />
      <share-button
        v-if="group"
        :text="$t('Check the exchange community {group}', {group: group.attributes.name})"
        :title="group.attributes.name"
      />
    </q-toolbar>

    <!-- Message Dialog -->
    <q-dialog v-if="group" v-model="contactsView">
      <q-card>
        <q-card-section class="q-pb-none">
          <div class="text-h6">{{ $t("Contact") }}</div>
        </q-card-section>
        <q-card-section>
          <social-network-list type="contact" :networks="groupContacts" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-pa-md">
      <!-- Loading spinner -->
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <!-- Group view -->

      <div v-if="group" class="row q-col-gutter-md">
        <!-- image -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-img :src="group.attributes.image" />
        </div>
        <!-- description -->
        <div class="col-12 col-sm-6 col-md-8">
          <div class="text-h6">{{ group.attributes.code }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-md2html="group.attributes.description" class="text-onsurface-m"></div>
          <q-separator spaced />
          <div class="k-inset-actions-md">
            <q-btn
              type="a"
              flat
              no-caps
              :href="group.attributes.website"
              target="_blank"
              icon="link"
              :label="group.attributes.website | link"
              color="onsurface-m"
            />
          </div>
        </div>
        <!-- explore -->
        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            v-if="offers"
            :title="$t('Offers')"
            icon="local_offer"
            :content="group.relationships.offers.meta.count"
            :href="code + '/offers'"
            :items="offers"
          />
          <q-inner-loading :showing="offers === null" color="icon-dark" />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            v-if="needs"
            :title="$t('Needs')"
            icon="loyalty"
            :content="group.relationships.needs.meta.count"
            :href="code + '/needs'"
            :items="needs"
          />
          <q-inner-loading :showing="needs === null" color="icon-dark" />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            v-if="membersCategory"
            :title="$t('Members')"
            icon="account_circle"
            :content="group.relationships.members.meta.count"
            :href="code + '/members'"
            :items="membersCategory"
          />
          <q-inner-loading :showing="membersCategory === null" color="icon-dark" />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            v-if="currencyLink"
            :title="$t('Currency')"
            icon="monetization_on"
            :content="currencySymbol"
            :href="code + '/stats'"
            :items="currency"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-8">
          <q-card square flat>
            <simple-map class="simple-map" :center="center" :marker="marker" />
            <q-card-section class="group-footer-card text-onsurface-m">
              <q-icon name="place" />
              {{ group.attributes.location.name }}
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-4 relative-position">
          <social-network-list type="contact" :networks="groupContacts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import marked from "marked";

import api from "../../services/Api/SocialApi";
import apiAccounting from "../../services/Api/AccountingApi";
import SimpleMap from "../../components/SimpleMap.vue";
import { Group, Contact, Category, CollectionResponse } from "./models/model";
import GroupStats from "../../components/GroupStats.vue";
import ShareButton from "../../components/ShareButton.vue";
import SocialNetworkList from "../../components/SocialNetworkList.vue";
import md2html from "../../plugins/Md2html";

interface ContactNames {
  [key: string]: {
    name: string;
  };
}

Vue.use(md2html);

/**
 * Page for Group details.
 */
export default Vue.extend({
  name: "Group",
  filters: {
    link(link: string): string {
      return link.replace(/(https|http):\/\//, "");
    }
  },
  components: {
    SimpleMap,
    ShareButton,
    GroupStats,
    SocialNetworkList
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      group: null as Group | null,
      contacts: [] as Contact[],
      isLoading: true,
      contactsView: false,
      socialButtonsView: false,
      needs: null as string[] | null,
      offers: null as string[] | null,
      currency: null as string[] | null,
      currencySymbol: null as string | null,
      currencyLink: null as string | null,
      membersCategory: null as string[] | null,
      moreCategories: "And more categories"
    };
  },
  computed: {
    center(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    },
    marker(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    },
    url(): string {
      return window.location.href;
    },
    title(): string {
      return document.title;
    },
    groupContacts(): ContactNames {
      return this.contacts?.reduce(
        (contacts: ContactNames, contact: Contact) => {
          contacts[contact.attributes.type] = {
            name: contact.attributes.name
          };
          return contacts;
        },
        {}
      );
    }
  },
  mounted: function(): void {
    this.fetchGroup(this.code);
    this.fetchOffers(this.code);
    this.fetchNeeds(this.code);
    this.fetchCurrency(this.code);
  },
  methods: {
    // Parse markdown.
    compiledMarkdown: function(text: string) {
      return marked(text, { sanitize: true, gfm: true, breaks: true });
    },
    // Currency info.
    async fetchCurrency(code: string) {
      try {
        this.currency = [];
        const responseCurrrency = await apiAccounting.getCurrencyStats(code);
        if (responseCurrrency !== null) {
          const att = responseCurrrency.attributes;
          this.currency.push(
            "" +
              att.stats.transaccions +
              " " +
              this.$t("transactions") +
              " / " +
              this.$t("year")
          );
          this.currency.push(
            "" +
              att.stats.exchanges +
              " " +
              this.$t("exchanges") +
              " / " +
              this.$t("year")
          );
          this.currency.push(
            "" +
              att.stats.circulation +
              " " +
              this.$t("circulation") +
              " / " +
              this.$t("year")
          );
          this.currency.push("1 ECO = 1 EÇ = 0,1 ℏ = 1 tk");
          this.currencySymbol = att.symbol;
          this.currencyLink = responseCurrrency.links.self;
        }
      } finally {
        this.isLoading = false;
      }
    },
    // Group info.
    async fetchGroup(code: string) {
      try {
        this.isLoading = true;
        this.group = null;
        this.contacts = [];
        const response = await api.getGroupStatus(code);
        this.group = response.group;
        this.contacts = response.contacts;
        this.membersCategory = [];
        const cm = response.group.meta.categoryMembers;

        if (cm) {
          for (let i = 0; i < cm.length; i++) {
            const name = this.$t(cm[i][0]);
            const count = cm[i][1];
            this.membersCategory.push(count + " " + name);
          }
        }
      } finally {
        this.isLoading = false;
      }
    },
    // Categories info.
    async fetchOffers(code: string) {
      try {
        // Offers.
        const responseOffers: CollectionResponse<Category> = await api.getCategories(
          code,
          undefined,
          "sort=relationships.offers.meta.count",
          1,
          4
        );
        this.offers = [];
        for (const category of responseOffers.data) {
          this.offers.push(
            category.relationships.offers.meta.count +
              " " +
              category.attributes.name
          );
        }
      } finally {
        if (this.offers) this.offers.push(this.moreCategories);
      }
    },
    async fetchNeeds(code: string) {
      try {
        // Needs.
        const responseNeeds: CollectionResponse<Category> = await api.getCategories(
          code,
          undefined,
          "sort=relationships.needs.meta.count",
          1,
          4
        );
        this.needs = [];
        for (const category of responseNeeds.data) {
          this.needs.push(
            category.relationships.needs.meta.count +
              " " +
              category.attributes.name
          );
        }
      } finally {
        if (this.needs) this.needs.push(this.moreCategories);
      }
    }
  }
});
</script>
