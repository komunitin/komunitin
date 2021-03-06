<template>
  <div>
    <page-header :title="group ? group.attributes.name : ''" balance>
      <template v-slot:buttons>
        <contact-button
          v-if="group"
          icon="message"
          round
          flat
          :contacts="group.contacts"
        />
        <share-button
          v-if="group"
          icon="share"
          flat
          round
          :text="
            $t('checkTheExchangeCommunityGroup', {
              group: group.attributes.name
            })
          "
          :title="group.attributes.name"
        />
      </template>
    </page-header>
    <q-page-container>
      <q-page class="q-pa-md">
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
          <div
            v-md2html="group.attributes.description"
            class="text-onsurface-m"
          ></div>
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
            :title="$t('offers')"
            icon="local_offer"
            :content="group.relationships.offers.meta.count"
            :href="code + '/offers'"
            :items="offersItems"
          />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            :title="$t('needs')"
            icon="loyalty"
            :content="group.relationships.needs.meta.count"
            :href="code + '/needs'"
            :items="needsItems"
          />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <!-- Not providing member types for the moment, as the Social Api does not give it -->
          <group-stats
            :title="$t('members')"
            icon="account_circle"
            :content="group.relationships.members.meta.count"
            :href="code + '/members'"
            :items="[]"
          />
        </div>

        <div class="col-12 col-sm-6 relative-position">
          <group-stats
            v-if="currency"
            :title="$t('currency')"
            icon="monetization_on"
            :content="currency.attributes.symbol"
            :href="code + '/stats'"
            :items="currencyItems"
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
          <social-network-list type="contact" :contacts="group.contacts" />
        </div>
      </div>
      </q-page>
  </q-page-container>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import SimpleMap from "../../components/SimpleMap.vue";
import { Group, Contact, Category, Currency } from "../../store/model";
import GroupStats from "../../components/GroupStats.vue";
import ShareButton from "../../components/ShareButton.vue";
import ContactButton from "../../components/ContactButton.vue";
import SocialNetworkList from "../../components/SocialNetworkList.vue";
import PageHeader from "../../layouts/PageHeader.vue";
import Md2html from "../../plugins/Md2html";

Vue.use(Md2html);

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
    ContactButton,
    GroupStats,
    SocialNetworkList,
    PageHeader
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      socialButtonsView: false
    };
  },
  computed: {
    group(): Group & { contacts: Contact[]; categories: Category[] } {
      return this.$store.getters["groups/current"];
    },
    currency(): Currency {
      return this.$store.getters["currencies/current"];
    },

    currencyItems(): string[] {
      return [];
      // FIXME: https://github.com/komunitin/komunitin/issues/81
      /*const stats = this.currency.attributes.stats;
      return [
        `${stats.transactions} ${this.$t("transactions")}/${this.$t("year")}`,
        `${stats.exchanges} ${this.$t("exchanges")}/${this.$t("year")}`,
        `${stats.circulation} ${this.$t("circulation")}`
        // Missing the string showing currency value
        // "1 ECO = 1 EÇ = 0,1 ℏ = 1 tk"
      ];*/
    },
    offersItems(): string[] {
      return this.buildCategoryItems("offers");
    },
    needsItems(): string[] {
      return this.buildCategoryItems("needs");
    },
    center(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    },
    marker(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    }
  },
  created() {
    // If I just call the fetch functions in created or mounted hook, then navigation from
    // `/groups/GRP1` to `/groups/GRP2` doesn't trigger the action since the
    // component is reused. If I otherwise add the `wath` Vue component member, the
    // tests fail and give "You may have an infinite update loop in a component
    // render function". So that's the way I found to make it work.
    //
    // https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes
    this.$watch("code", this.fetchData, { immediate: true });
  },
  methods: {
    async fetchData(code: string) {
      this.isLoading = true;
      try {
        // We are using the fact that a group and its related currency
        // share the same unique code. This way we can make the two calls 
        // in parallel. Another option, formally more robust but less 
        // efficient would be to get the currency url from the group data.
        await Promise.all([this.fetchGroup(code), this.fetchCurrency(code)]);
      } finally {
        this.isLoading = false;
      }
    },
    // Group info.
    async fetchGroup(code: string) {
      return this.$store.dispatch("groups/load", {
        code,
        include: "contacts,categories"
      });
    },
    // Currency info.
    async fetchCurrency(code: string) {
      return this.$store.dispatch("currencies/load", { code });
    },
    // Categories info.
    buildCategoryItems(type: "offers" | "needs"): string[] {
      // Copy original arrray not to modify it when sorting.
      const items: string[] = this.group.categories
        .slice()
        .sort(
          (a, b) =>
            b.relationships[type].meta.count - a.relationships[type].meta.count
        )
        .slice(0, 4)
        .map(
          category =>
            `${category.relationships[type].meta.count} ${category.attributes.name}`
        );
      if (this.group.categories.length > 4) {
        items.push(this.$t("andMoreCategories").toString());
      }
      return items;
    }
  }
});
</script>
