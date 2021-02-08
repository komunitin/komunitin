<template>
  <div>
    <q-inner-loading :showing="isLoading" color="icon-dark" />
    <q-infinite-scroll :disable="!autoload || disableScrollLoad" @load="loadNext">
      <empty v-if="isEmpty && !isLoading"/>
      <slot v-else-if="!isLoading" :resources="resources">
        <div class="q-pa-md row q-col-gutter-md">
          <div
            v-for="resource of resources"
            :key="resource.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <!-- this v-if is superfluous, since when this slot is rendered, card is always defined.
            But setting it prevents an unexpected exception in vue-test-utils -->
            <component :is="card" v-if="card" :[propName]="resource" :code="code"/>
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
</template>

<script lang="ts">
import Vue from "vue";
import { ResourceObject } from "../store/model";
import Empty from "../components/Empty.vue";

/**
 * Generic resource card list.
 */
export default Vue.extend({
  name: "ResourceCards",
  components: {
    Empty
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
     * Enable autoloading feature. Default to true.
     * 
     * Useful if you want to temporaly deactivate autoloading while 
     * performing operations between loading the resources and being 
     * able to display them.
     */
    autoload: {
      type: Boolean,
      required: false,
      default: true,
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
    },
    isEmpty() : boolean {
      return this.resources.length == 0;
    }
  },
  // Note that even if this is marked async, Vue does not wait for the
  // promise to be resolved to continue the rendering. It is done just
  // to be able to fetch resources after locate.
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
          filter: this.filter,
          sort: this.sort,
        });
        this.resources.push(...this.$store.getters[this.moduleName + "/currentList"]);
        this.$emit("afterLoad");
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
          include: this.include,
          sort: this.sort,
        });
        this.resources.push(...this.$store.getters[ this.moduleName + "/currentList"]);
        this.$emit("afterLoad");
      }
      done(!this.$store.getters[this.moduleName + "/hasNext"]);
    }
  }
});
</script>
