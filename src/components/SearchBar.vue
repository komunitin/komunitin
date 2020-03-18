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
      v-if="viewSearch === true"
      id="input_search"
      v-model="search"
      class="search-kn"
      dark
      dense
      autofocus
      right
      @keyup.enter="searchBox()"
    />
    <q-btn id="button_search" right flat icon="search" @click="searchBox()" />
  </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SearchBar',
  props: ['title', 'backButton'],
  data() {
    return {
      search: '',
      viewSearch: false as boolean
    };
  },
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