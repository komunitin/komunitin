<template>
  <div class="bg-outside column full-height">
    <div
      id="container"
      class="q-mx-auto bg-surface"
      :class="drawerExists ? 'with-drawer' : 'without-drawer'"
    >
      <q-layout
        id="layout"
        view="LHH LpR LfR"
        container
      >
        <q-drawer
          v-if="drawerExists"
          v-model="drawerState"
          bordered
          show-if-above
          :width="256"
          @on-layout="drawerChange"
        >
          <menu-drawer />
        </q-drawer>
        <router-view />
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MenuDrawer from "../components/MenuDrawer.vue";

/**
 * Main app layout.
 * 
 * Contains the left drawer but not the header, which should be defined by each page
 * using the PageHeader component.
 */
export default defineComponent({
  name: "Layout",
  components: {
    MenuDrawer
  },
  computed: {
    drawerExists(): boolean {
      return this.$store.getters.drawerExists
    },
    drawerState: {
      get () {
        return this.$store.state.ui.drawerState
      },
      set (val: boolean) {
        this.$store.commit('drawerState', val)
      }
    }
  },
  methods: {
    drawerChange(state: boolean) {
      this.$store.commit("drawerPersistent", state);
    },
  }
});
</script>
<style lang="scss" scoped>
// Container takes 100% with in small screens. In large screens, wrap the content in a
// centered box. The width of the box depends on whether there is drawer or not.
@mixin wrap-main-container($width) {
  // The 18px is an estimation of the scroll-bar width.
  @media (min-width: $width + 18px) {
    width: $width;
    height: calc(100% - 24px);
    margin-top: 24px;
  }
}
#container {
  width: 100%;
  height: 100%;
  &.with-drawer {
    @include wrap-main-container(1280px);
  }
  &.without-drawer {
    @include wrap-main-container(1024px);
  }
}
</style>
