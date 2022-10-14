<template>
  <div>
    <q-header
      id="header"
      class="bg-primary"
      :class="showBalance ? 'column' : 'row'"
      :style="`height: ${computedHeight}px;`"
    >
      <q-toolbar
        class="text-onprimary"
        :class="(showBalance ? '' : 'col-shrink ') + (noButton ? 'q-px-none' : 'q-pr-none')"
        :style="`min-height: ${toolbarHeight}px`"
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
      <div
        v-if="showBalance"
        class="col self-center column items-center"
      > 
        <div 
          class="text-body2 text-onprimary-m"
          :style="`font-size: ${0.875*balanceScaleFactor}rem; line-height: ${1.25*balanceScaleFactor}rem;`"
        >
          {{ $t('balance') }}
        </div>
        <div 
          class="text-h3 text-onprimary-m"
          :style="`font-size: ${3*balanceScaleFactor}rem; line-height: ${3.125*balanceScaleFactor}rem`"
        >
          {{
            FormatCurrency(
              myAccount.attributes.balance,
              myAccount.currency
            )
          }}
        </div>
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
          @update:model-value="onUpdateSearchText"
          @keyup.enter="onSearch"
        >
          <template #append>
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
        <slot name="buttons" />
        <q-scroll-observer
          v-if="balance"
          @scroll="scrollHandler"
        />
      </q-toolbar>
    </q-header>
    <!-- We add a dummy transparent div here to add the height we substract from the collapsible part.
  I've not been able to do it in a more elegant fashion :(
  
  The point is that QPageContainer dynamically sets a padding-top equal to the QHeader height. Since we 
  reduce this height on scroll, then the page goes up as twice as fast, because of the scrolling and 
  because of the shrinking. With this dummy div we compensate one of those to achieve normal behavior.
   -->
    <div :style="`height: ${offsetHeight}px`" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import FormatCurrency from "../plugins/FormatCurrency";

/**
 * Header component with some features for the Komunitin app
 *  - In small screens, shows a menu button or a back button depending on wether 
 * exists the left drawer, which in turn depends on whether the user is logged in.
 *  - If balance prop is set to true, shows a section with the logged in account 
 * balance. This section shrinks on scroll.
 *  - If search prop is set to true, provides a search box that emits the `search` event.
 *  - Provides a slot #buttons to be able to customize the right toolbar buttons 
 * depending on the page content.
 */
export default defineComponent({
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
  emits: ['search-input', 'search'],
  setup() {
    return {
      FormatCurrency
    }
  },
  data() {
    return {
      searchActive: false,
      searchText: "",
      scrollOffset: 0,
      offset: 0,
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
    /**
     * Constant value for the thin header height.
     */
    headerHeight(): number { return 64 },
    /**
     * Constant value for the toolbar height.
     */
    toolbarHeight(): number { return 50 },
    /**
     * Constant value for the height of the balance section.
     */
    balanceHeight(): number { return 70 },

    prominentHeight(): number {
      return 2 * this.toolbarHeight + this.balanceHeight;
    },
    originalHeight(): number {
      return this.balance && this.myAccount ? this.prominentHeight : this.headerHeight;
    },
    computedHeight(): number {
      return this.originalHeight - this.offset;
    },
    balanceScaleFactor():number {
      return Math.max(0, 1 - this.offset / this.balanceHeight);
    },
    showBalance() : boolean {
      return this.balance && this.myAccount && this.offset < this.balanceHeight;
    },
    offsetHeight() : number {
      return this.originalHeight - this.computedHeight;
    }
  },
  methods: {
    clearSearchText() {
      this.searchText = "";
      this.$emit("search-input", "");
    },
    scrollHandler(details: { position: { top: number; }; }) {      
      this.offset = Math.min(details.position.top, this.originalHeight - this.headerHeight)
      this.scrollOffset = details.position.top;
    },
    onUpdateSearchText() {
      this.$emit('search-input', this.searchText)
    },
    onSearch() {
      this.$emit('search', this.searchText);
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
