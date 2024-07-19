<template>
  <div>
    <q-infinite-scroll
      v-if="!isLoading"
      @load="loadNext"
    >
      <empty v-if="isEmpty" />
      <slot
        v-else
        :resources="resources"
      >
        <div class="q-pa-md row q-col-gutter-md">
          <div
            v-for="resource of resources"
            :key="resource.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <!-- this v-if is superfluous, since when this slot is rendered, card is always defined.
            But setting it prevents an unexpected exception in vue-test-utils -->
            <component
              :is="card"
              v-if="card"
              :[propName]="resource"
              :code="code"
            />
          </div>
        </div>
      </slot>
      <template #loading>
        <div class="row justify-center q-my-md">
          <!-- 42px is the default size of q-inner-loading -->
          <q-spinner
            color="icon-dark"
            size="42px"
          />
        </div>
      </template>
    </q-infinite-scroll>
    <q-inner-loading
      :showing="isLoading"
      color="icon-dark"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Empty from "../components/Empty.vue";
import { ResourceObject } from "../store/model";
import { ResourcesState } from "../store/resources"
import NeedCard from "../components/NeedCard.vue";
import OfferCard from "../components/OfferCard.vue";
import GroupCard from "../components/GroupCard.vue"
/**
 * Generic resource card list.
 */
export default defineComponent({
  name: "ResourceCards",
  components: {
    Empty,
    NeedCard,
    OfferCard,
    GroupCard
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
     * The item Vue Component Name
     */
    card: {
      type: String,
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
     * The name of the vuex resources module.
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
     * The sort parameter string when fetching resources.
     */
    sort: {
      type: String,
      required: false,
      default: ""
    },
    /**
     * Filter object. Each pair `key => value` will be added as a
     * query parameter `filter[key]=value`.
     */
    filter: {
      type: Object,
      required: false,
      default: () => ({})
    },
    /**
     * Search query
     */
    query: {
      type: String,
      required: false,
      default: ""
    }
  },
  emits: ['page-loaded'],
  data() {
    return {
      ready: false
    };
  },
  computed: {
    storeState(): ResourcesState<ResourceObject> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this.$store.state as any)[this.moduleName]
    },
    location(): [number, number] | undefined {
      return this.$store.state.me.location;
    },
    isEmpty() : boolean {
      return this.resources.length === 0;
    },
    resources() : ResourceObject[] {
      const resources = []
      const state = this.storeState;
      if (state.currentPage !== null) {
        for (let i = 0; i <= state.currentPage; i++) {
          const page = this.$store.getters[this.moduleName + '/page'](i)
          if (page) {
            resources.push(...page)
          }
        }
      }
      
      return resources
    },
    /**
     * Return true if still don't have any content and we're waiting for data do be fetched.
     * Return false if we already have some data, even if is from cache and being revalidated.
     */
    isLoading() : boolean {
      const state = this.storeState
      return (!this.ready || state.currentPage === null || state.currentPage === 0 && state.next === undefined && this.isEmpty)
    }
  },
  // Note that even if this is marked async, Vue does not wait for the
  // promise to be resolved to continue the rendering. It is done just
  // to be able to fetch resources after locate.
  created: async function() {
    this.fetchResources(this.query)
    // Set the current page to 0 etc in fetchResources before enabling scroll load.
    this.ready = true
    // Refresh results if search query change.
    this.$watch(() => this.query, (newQuery: string) => this.fetchResources(newQuery))
    // Refresh results if code changes.
    this.$watch(() => this.code, () => this.fetchResources(this.query))
  },
  methods: {
    /**
     * Load groups ordered by location, if available. Optionally filter them by a search
     */
    async fetchResources(search?: string) {
      await this.$store.dispatch(this.moduleName + "/loadList", {
        location: this.location,
        search,
        include: this.include,
        group: this.code,
        filter: this.filter,
        sort: this.sort,
      });
      this.$emit("page-loaded", 0);
    },
    /**
     * Implementation of the QInfiniteScroll load callback.
     */
    async loadNext(index: number, done: (stop?: boolean) => void) {
      if (this.$store.getters[this.moduleName + "/hasNext"]) {
        await this.$store.dispatch(this.moduleName + "/loadNext", {
          group: this.code,
          include: this.include,
          sort: this.sort,
        });
        this.$emit("page-loaded", this.storeState.currentPage);
      }
      // Stop loading if there is no next page. Note that we're not
      // stopping the infinite scrolling if hasNext returns undefined.
      done(this.$store.getters[this.moduleName + "/hasNext"] === false);
    }
  }
});
</script>
