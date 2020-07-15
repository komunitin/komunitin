<template>
  <q-header id="header" class="bg-primary" :class="showBalance ? 'column' : 'row'" :style="`height: ${computedHeight}px;`">
    <q-toolbar
      class="text-onprimary"
      :class="(showBalance ? '' : 'col-shrink ') + (noButton ? 'q-px-none' : 'q-pr-none')"
      style="min-height: 50px"
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
    </q-toolbar>
    <div v-if="showBalance"
      class="col self-center column items-center"
    > 
      <div class="text-body2 text-onprimary-m"
      :style="`font-size: ${0.875*balanceScaleFactor}rem; line-height: ${1.25*balanceScaleFactor}rem;`">{{$t('balance')}}</div>
      <div class="text-h3 text-onprimary-m"
      :style="`font-size: ${3*balanceScaleFactor}rem; line-height: ${3.125*balanceScaleFactor}rem`">{{
        $currency(
          myAccount.attributes.balance,
          myAccount.currency
        )
      }}</div>
    </div>
    <q-toolbar :class="((noButton || showBalance) ? 'no-button ' : '') + (showBalance ? '' : 'col-grow q-pl-none')">
      <q-toolbar-title v-if="!searchActive">
        {{ title }}
      </q-toolbar-title>
      

      <q-input
        v-if="searchActive"
        v-model="searchText"
        dark
        dense
        standout
        class="q-mr-xs search-box"
        :class="noButton ? '' : 'q-ml-md'"
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
      <q-scroll-observer v-if="balance" @scroll="scrollHandler" />
    </q-toolbar>
  </q-header>
</template>
<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import FormatCurrency from "../plugins/FormatCurrency";

Vue.use(FormatCurrency);

interface ScrollDetails {
  position: number;
  direction: "up" | "down";
  directionChanged: boolean;
  inflexionPosition: number;
}

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
    },
    /**
     * Make the toolbar prominent and show the current balance.
     */
    balance: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchActive: false,
      searchText: "",
      scrollOffset: 0,
    }
  },
  computed: {
    ...mapGetters(["myAccount"]),
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
    /**
     * Show no button
     */
    noButton(): boolean {
      return !this.showBack && !this.showMenu;
    },
    headerHeight(): number { return 64 },
    toolbarHeight(): number { return 50 },
    balanceHeight(): number { return 70 },
    prominentHeight(): number {
      return 2 * this.toolbarHeight + this.balanceHeight;
    },
    originalHeight(): number {
      // $header-height = 64
      return this.balance && this.myAccount ? this.prominentHeight : this.headerHeight;
    },
    computedHeight(): number {
      return Math.max(64, this.originalHeight - this.scrollOffset);
    },
    balanceScaleFactor():number {
      return Math.min(1, Math.max(0, 1 - ((this.scrollOffset) / this.balanceHeight)));
    },
    showBalance() : boolean {
      return this.balance && this.myAccount && (this.balanceScaleFactor > 0);
    }
  },
  methods: {
    clearSearchText() {
      this.searchText = "";
      this.$emit("search-input", "");
    },
    scrollHandler(details: ScrollDetails) {
      this.scrollOffset = details.position;
    }
  }
});
</script>
<style lang="scss" scoped>
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
