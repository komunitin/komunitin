<template>
  <div>
    <page-header
      :search="true"
      :title="$t('offers')"
      @search="fetchOffers"
    />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <div class="row q-col-gutter-md">
        <div
          v-for="offer of offers"
          :key="offer.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <offer-card :offer="offer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { Offer } from "../../store/model";

import PageHeader from "../../layouts/PageHeader.vue";
import OfferCard from "../../components/OfferCard.vue";

/**
 * Groups's list.
 */
export default Vue.extend({
  name: "GroupList",
  components: {
    PageHeader,
    OfferCard
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
    };
  },
  computed: {
    offers(): Offer[] {
      return this.$store.getters["offers/currentList"];
    },
    location(): [number,number] | undefined {
      return this.$store.state.me.location;
    }
  },
  mounted: async function() {
    await this.$store.dispatch("locate");
    await this.fetchOffers();
  },
  methods: {
    /**
     * Load groups ordered by location, if available. Optionally filter them by a search
     */
    async fetchOffers(search?: string) {
      try {
        this.isLoading = true;
        await this.$store.dispatch("offers/loadList", {
          location: this.location,
          search,
          include: "member,category",
          group: this.code
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>