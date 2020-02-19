<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <headerApp />
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <menuPanel />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import menuPanel from 'components/home/MenuPanel.vue';
import headerApp from 'components/home/Header.vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'BaseLayout',
  components: {
    menuPanel,
    headerApp
  }
});
</script>
