<template>
  <q-toolbar class="bg-primary text-onprimary">
    <q-btn
      v-if="backButton"
      id="back"
      flat
      round
      icon="arrow_back"
      :aria-label="$t('Back')"
      @click="$router.back()"
    />

    <q-toolbar-title v-if="!viewSearch">{{ $t(title) }}</q-toolbar-title>

    <q-input
      v-if="viewSearch"
      id="input_search"
      v-model="search"
      dark
      dense
      autofocus
      class="full-width"
      @keyup.enter="searchBox()"
    />
    <q-btn id="button_search" right flat round icon="search" @click="searchBox()" />
  </q-toolbar>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SearchBar",
  props: {
    title: {
      type: String,
      default: "Need title",
      required: true
    },
    backButton: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      search: "",
      viewSearch: false as boolean
    };
  },
  methods: {
    /**
     * - One click open input.
     * - Second click launch search.
     */
    searchBox() {
      if (this.search !== "") {
        // Launch search.
        // this.getGroupsListFilter(this.search);
        this.$emit("newSearch", this.search);
      } else {
        this.viewSearch = !this.viewSearch;
      }
    }
  }
});
</script>
