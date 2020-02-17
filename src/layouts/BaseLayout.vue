<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <Header />
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-2">
      <MenuPanel />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import MenuPanel from 'components/home/MenuPanel.vue';
import Header from 'components/home/Header.vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'BaseLayout',
  components: {
    MenuPanel,
    Header
  }
});
</script>
