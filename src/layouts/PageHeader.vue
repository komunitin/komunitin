<template>
  <div id="header" class="column justify-center bg-primary">
    <q-toolbar
      class="text-onprimary"
      :class="!showBack && !showMenu ? 'no-button' : ''"
    >
      <!-- render back button, menu button or none -->
      <q-btn
        v-if="showBack"
        id="back"
        flat
        round
        icon="arrow_back"
        :aria-label="$t('back')"
        @click="$router.back()"
      />
      <q-btn
        v-if="showMenu"
        id="menu"
        flat
        round
        icon="menu"
        :aria-label="$t('menu')"
        @click="$store.dispatch('toogleDrawer')"
      />

      <q-toolbar-title v-if="!searchActive">
        {{ title }}
      </q-toolbar-title>

      <q-input
        v-if="searchActive"
        v-model="searchText"
        dark
        dense
        standout
        class="q-ml-md q-mr-xs search-box"
        type="search"
        debounce="250"
        autofocus
        @input="$emit('search-input', searchText)"
        @keyup.enter="$emit('search', searchText)"
      >
        <template v-slot:append>
          <q-icon
            v-if="searchText === ''"
            name="search"
            class="cursor-pointer"
            @click="searchActive = false"
          />
          <q-icon
            v-else
            name="clear"
            class="cursor-pointer"
            @click="clearSearchText"
          />
        </template>
      </q-input>

      <q-btn
        v-if="search && !searchActive"
        flat
        round
        icon="search"
        @click="searchActive = true"
      />

      <!-- slot for right buttons -->
      <slot name="buttons"></slot>
    </q-toolbar>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "PageHeader",
  props: {
    /**
     * Page title
     */
    title: {
      type: String,
      default: ""
    },
    /**
     * Enable search feature
     */
    search: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    searchActive: false,
    searchText: ""
  }),
  computed: {
    /**
     * Show the back button.
     */
    showBack(): boolean {
      return !this.$store.getters.drawerExists;
    },
    /**
     * Show the menu button.
     */
    showMenu(): boolean {
      return !this.showBack && !this.$store.state.ui.drawerPersistent;
    },
  },
  methods: {
    clearSearchText() {
      this.searchText = "";
      this.$emit("search-input", "");
    }
  }
});
</script>
<style lang="scss" scoped>

// On large screens, when the drawer is persistent, set the header height 
// plus 1px because the border is included in the height.
//@media(min-width: 1023px) {
  #header {
    height: $header-height + 1px;
  }
//}
// Toolbar has a default padding of 12px. That's ok when there's a button,
// but it is too low when there's the title directly.
.no-button {
  padding-left: 16px;
}

// We need to say that the search box takes all horizontal space, but the
// quasar class full-width does not work for us because it overwrites the margins.
.search-box {
  width: 100%;
}
</style>
