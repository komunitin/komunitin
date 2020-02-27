<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$router.currentRoute.path == '/'"
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-btn
          v-else
          flat
          dense
          round
          icon="arrow_back"
          aria-label="Home"
          @click="$router.back()"
        />

        <q-toolbar-title>Komunitin</q-toolbar-title>

        <div>
          <q-btn flat dense round icon="share" aria-label="Share" />
          <q-btn flat dense round icon="account_circle" aria-label="Account" />
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container class="container-kn">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'ExchangesLayout',
  data() {
    return {
      leftDrawerOpen: false
    };
  }
});
</script>
<style scope>
body {
  background-color: rgb(255, 255, 255, 1) !important;
  color: black !important;
  background-image: none !important;
}
</style>
