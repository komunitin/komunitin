<template>
  <div>
    <page-header :search="true" :title="title" @search="fetchResources" />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <q-infinite-scroll :disable="disableScrollLoad" @load="loadNext">
        <div class="row q-col-gutter-md">
          <div
            v-for="resource of resources"
            :key="resource.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <component :is="card" :[propName]="resource" />
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

import { ResourceObject } from "../store/model";

import PageHeader from "../layouts/PageHeader.vue";

/**
 * Generic resource card list.
 */
export default Vue.extend({
  name: "ResourceCardList",
  components: {
    PageHeader,
  },
  props: {
    code: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    card: {
      type: Function,
      required: true,
      default: null,
    },
    propName: {
      type: String,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    include: {
      type: String,
      required: false,
      default: ""
    }
  },
  data() {
    return {
      isLoading: true,
      disableScrollLoad: true,
      resources: [] as ResourceObject[]
    };
  },
  computed: {
    location(): [number, number] | undefined {
      return this.$store.state.me.location;
    }
  },
  created: async function() {
    await this.$store.dispatch("locate");
    await this.fetchResources();
  },
  methods: {
    /**
     * Load groups ordered by location, if available. Optionally filter them by a search
     */
    async fetchResources(search?: string) {
      try {
        this.isLoading = true;
        this.disableScrollLoad = true;
        this.resources = [];
        await this.$store.dispatch(this.moduleName + "/loadList", {
          location: this.location,
          search,
          include: this.include,
          group: this.code
        });
        this.resources.push(...this.$store.getters[this.moduleName + "/currentList"]);
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
      if (this.$store.getters[this.moduleName + "/hasNext"]) {
        await this.$store.dispatch(this.moduleName + "/loadNext");
        this.resources.push(...this.$store.getters[ this.moduleName + "/currentList"]);
      }
      done(!this.$store.getters[this.moduleName + "/hasNext"]);
    }
  }
});
</script>
