<template>
  <div>
    <page-header
      search
      :title="title"
      balance
      @search="fetchResources"
    />
    <q-page-container>
      <q-page>
        <resource-cards
          ref="resourceCards"
          v-bind="$attrs"
        />
        <slot name="after" />
      </q-page>
    </q-page-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PageHeader from "../layouts/PageHeader.vue";
import ResourceCards from "./ResourceCards.vue"

/**
 * Generic resource card list.
 */
export default defineComponent({
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
      (this.$refs.resourceCards as {fetchResources: (s:string) => void}).fetchResources(search);
    }
  }
  
});
</script>
