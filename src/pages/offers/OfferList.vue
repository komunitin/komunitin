<template>
  <div>
    <page-header :search="true" :title="$t('offers')" @search="fetchOffers" />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <q-infinite-scroll :disable="disableScrollLoad" @load="loadNext">
        <div class="row q-col-gutter-md">
          <div
            v-for="offer of offers"
            :key="offer.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <offer-card :offer="offer" />
          </div>
        </div>
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <!-- 42px is the default size of q-inner-loading -->
            <q-spinner color="icon-dark" size="42px" />
          </div>
        </template>
      </q-infinite-scroll>
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
      disableScrollLoad: true,
      offers: [] as Offer[]
    };
  },
  computed: {
    location(): [number, number] | undefined {
      return this.$store.state.me.location;
    }
  },
  created: async function() {
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
        this.disableScrollLoad = true;
        this.offers = [];
        await this.$store.dispatch("offers/loadList", {
          location: this.location,
          search,
          include: "member,category",
          group: this.code
        });
        this.offers.push(...this.$store.getters["offers/currentList"]);
      } finally {
        this.isLoading = false;
        // Delay one tick before enabling infinite-scroll loading in order to allow the
        // fetched content to be displyed before checking the scroll position.
        await this.$nextTick();
        this.disableScrollLoad = false;
      }
    },
    /**
     * Implementation of the QInfiniteScroll load callback.
     */
    async loadNext(index: number, done: (stop?: boolean) => void) {
      if (this.$store.getters["offers/hasNext"]) {
        await this.$store.dispatch("offers/loadNext");
        this.offers.push(...this.$store.getters["offers/currentList"]);
      }
      done(!this.$store.getters["offers/hasNext"]);
    }
  }
});
</script>
