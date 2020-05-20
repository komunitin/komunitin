<template>
  <div class="bg-outside column">
    <div id="container" class="q-mx-auto bg-surface" :class="showDrawer ? 'with-drawer' : 'without-drawer'">
      <q-layout id="layout" view="lhh lpr lfr">
        <q-drawer
          v-if="showDrawer"
          v-model="drawer"
          bordered
          show-if-above
          :width="256"
          :breakpoint="800"
        >
          <menu-drawer />
        </q-drawer>
        <q-header id="header" bordered class="column justify-center">
          <slot name="toolbar">
            <q-toolbar class="bg-primary text-onprimary">
              <!-- render either back button or menu button -->
              <q-btn
                v-if="back"
                id="back"
                flat
                round
                icon="arrow_back"
                :aria-label="$t('back')"
                @click="$router.back()"
              />
              <q-btn v-else flat round icon="menu" />

              <q-toolbar-title>
                {{ title }}
              </q-toolbar-title>

              <!-- slot for right buttons -->
              <slot name="buttons"></slot>
            </q-toolbar>
          </slot>
        </q-header>
        <q-page-container>
          <slot />
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import MenuDrawer from "../components/MenuDrawer.vue";

/**
 * Main app layout.
 *
 * Pages should use this component as its top-level wrapper:
 * ```
 * <layout>
 *   <!-- Page content -->
 * </layout>
 * ```
 * Pages may overwrite the default toolbar by:
 * ```
 * <layout>
 *   <template v-slot:toolbar>
 *     <!-- Define here your custom toolbar -->
 *   </template>
 * </layout>
 * ```
 * Or just the right toolbar buttons:
 * ```
 * <layout>
 *   <template v-slot:buttons>
 *     <!-- Define here your custom right toolbar buttons -->
 *   </template>
 * </layout>
 * ```
 */
export default Vue.extend({
  name: "Layout",
  components: {
    MenuDrawer
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    back: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    drawer: true
  }),
  computed: {
    showDrawer(): boolean {
      return this.$store.getters.isLoggedIn;
    }
  }
});
</script>
<style lang="scss" scope>
// Set the header height plus 1px because the border is included in the height.
#header {
  height: $header-height + 1px;
}

// Container takes 100% with in small screens. In large screens, wrap the content in a
// centered box. The width of the box depends on whether there is drawer or not.
@mixin wrap-main-container($width) {
  // The 18px is an estimation of the scroll-bar width.
  @media (min-width: $width + 18px) {
    width: $width;
    margin-top: 48px;
    margin-bottom: 48px;
  }
}
#container {
  width: 100%;
  &.with-drawer {
    @include wrap-main-container(1280px);
  }
  &.without-drawer {
    @include wrap-main-container(1024px);
  }
}

</style>
