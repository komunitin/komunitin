<template>
  <q-toolbar class="bg-primary text-onprimary">
    <q-btn
      v-if="backButton"
      flat
      round
      icon="arrow_back"
      aria-label="Home"
      @click="$router.back()"
    />

    <q-toolbar-title v-if="!viewSearch"> {{ $t(title) }} </q-toolbar-title>

    <q-input
      id="input_search"
      v-if="viewSearch"
      @keyup.enter="searchBox()"
      v-model="search"
      dark
      dense
      autofocus
      class="full-width"
    />
    <q-btn
      id="button_search"
      right
      flat
      round
      v-on:click="searchBox()"
      icon="search"
    />
  </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Search-Bar',
  data() {
    return {
      search: '',
      viewSearch: false as boolean
    };
  },
  props: ['title', 'backButton'],
  methods: {
    /**
     * - One click open input.
     * - Second click launch search.
     */
    searchBox() {
      if (this.search !== '') {
        // Launch search.
        // this.getGroupsListFilter(this.search);
        this.$emit('newSearch', this.search);
      } else {
        this.viewSearch = !this.viewSearch;
      }
    }
  }
});
</script>
