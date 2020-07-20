<template>
  <div>
    <page-header search :title="title" balance @search="fetchResources" />
    <q-page-container>
      <q-page>
      <resource-cards ref="resourceCards" v-bind="$attrs"/>
    </q-page>
  </q-page-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import PageHeader from "../layouts/PageHeader.vue";
import ResourceCards from "./ResourceCards.vue"

/**
 * Generic resource card list.
 */
export default Vue.extend({
  name: "ResourceCardList",
  components: {
    PageHeader,
    ResourceCards
  },
  props: {
    /**
     * The page title
     */
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    fetchResources(search: string) : void {
      (this.$refs.resourceCards as Vue & {fetchResources: (s:string) => void}).fetchResources(search);
    }
  }
  
});
</script>
