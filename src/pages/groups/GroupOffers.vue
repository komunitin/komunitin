<template>
  <div>
    <search-bar :title="$t('Offers')" :back-button="true" @newSearch="fetchOffers" />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <div class="row q-col-gutter-md">
        <div v-for="offer of offers" :key="offer.id" class="col-12 col-sm-6 col-md-4">
          <offer-card :offer="offer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import api from "../../services/Api/SocialApi";
import { OfferSummary } from "./models/model";

import SearchBar from "../../components/SearchBar.vue";
import OfferCard from "../../components/OfferCard.vue";

/**
 * Offers's list.
 *
 * @todo Filters by Category.
 * @todo Order by latest first, nearest first, most relevant first.
 */
export default Vue.extend({
  name: "OfferList",
  components: {
    SearchBar,
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
      offers: [] as OfferSummary[],
      isLoading: true as boolean
    };
  },
  mounted: function() {
    this.fetchOffers();
  },
  methods: {
    /**
     * Load offers ordered by location, if available. Optionally filter them by a search
     */
    async fetchOffers(search?: string) {
      try {
        this.isLoading = true;
        this.offers = await api.getOffers(this.code, search);
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>
