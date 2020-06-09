<template>
  <div>
    <page-header :search="true" :title="title" @search="fetchResources" />
    <div>
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <q-infinite-scroll :disable="disableScrollLoad" @load="loadNext">
        <slot v-if="!isLoading" :resources="resources">
          <div class="q-pa-md row q-col-gutter-md">
            <div
              v-for="resource of resources"
              :key="resource.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <!-- this v-if is superfluous, since when this slot is rendered, card is always defined.
              But setting it prevents an unexpected exception in vue-test-utils -->
              <component :is="card" v-if="card" :[propName]="resource" />
            </div>
          </div>
        </slot>
        <template #loading>
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
    /**
     * The group code
     */
    code: {
      type: String,
      required: true
    },
    /**
     * The page title
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * The item Vue Component Constructor
     */
    card: {
      type: Function,
      required: false,
      default: null,
    },
    /**
     * The name of the property that should be send 
     * to the item Vue components.
     */
    propName: {
      type: String,
      required: false,
      default: ""
    },
    /**
     * THe name of the vuex resources module.
     */
    moduleName: {
      type: String,
      required: true,
    },
    /**
     * The include parameter string when fetching resources.
     */
    include: {
      type: String,
      required: false,
      default: ""
    },
    /**
     * Extra options to add to the load action. Must be an object 
     * that will be added to the payload parameter of the loadList
     * vuex action.
     */
    loadOptions: {
      type: Object,
      required: false,
      default: () => ({})
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
          group: this.code,
          ...this.loadOptions
        });
        this.resources.push(...this.$store.getters[this.moduleName + "/currentList"]);
      } finally {
        this.isLoading = false;
        // Delay one tick before enabling infinite-scroll loading in order to allow the
        // fetched content to be displyed before checking the scroll position.
        await this.$nextTick();
        if (this.$store.getters[this.moduleName + "/hasNext"]) {
          this.disableScrollLoad = false;
        }
      }
    },
    /**
     * Implementation of the QInfiniteScroll load callback.
     */
    async loadNext(index: number, done: (stop?: boolean) => void) {
      if (this.$store.getters[this.moduleName + "/hasNext"]) {
        await this.$store.dispatch(this.moduleName + "/loadNext", {
          group: this.code,
          include: this.include
        });
        this.resources.push(...this.$store.getters[ this.moduleName + "/currentList"]);
      }
      done(!this.$store.getters[this.moduleName + "/hasNext"]);
    }
  }
});
</script>
