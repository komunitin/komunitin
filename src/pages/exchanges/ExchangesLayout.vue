<template>
  <q-layout view="lHh Lpr lFf">
    <router-view />
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
.q-header {
  z-index: 3001;
}
.col-kn {
  margin-top: 0px;
}
.card-kn {
  width: 100%;
}
</style>
