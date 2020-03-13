<template>
  <q-toolbar>
    <q-btn
      v-if="backButton"
      flat
      dense
      round
      icon="arrow_back"
      aria-label="Home"
      @click="$router.back()"
    />

    <q-toolbar-title v-if="viewSearch !== true">
      {{
      $t(title)
      }}
    </q-toolbar-title>

    <q-input
      id="input_search"
      v-if="viewSearch === true"
      @keyup.enter="searchBox()"
      class="search-kn"
      dark
      v-model="search"
      dense
      autofocus
      right
    />
    <q-btn id="button_search" right flat v-on:click="searchBox()" icon="search" />
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
        // this.getExchangesListFilter(this.search);
        this.$emit('newSearch', this.search);
      } else {
        this.viewSearch = !this.viewSearch;
      }
    }
  }
});
</script>