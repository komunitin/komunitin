<template>
  <div class="bg-outside column">
    <div id="container" class="q-mx-auto bg-surface">
      <q-layout view="lhr lpr lfr">
        <q-page-container>
          <router-view />
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Layout without left drawer and maximum width for unregistered users.
 *
 * This layout is used when browsing the app before being registered to
 * any exchange group. That includes browsing groups list and checking
 * group details, offers etc.
 *
 * The header needs to be defined by every page.
 */
export default Vue.extend({
  name: 'Guest'
});
</script>
<style lang="scss" scope>
#container {
  width: 100%;
}
// With large screens, wrap the content in a centered box.
@media (min-width: $breakpoint-md-min) {
  #container {
    margin-top: 48px;
    width: 1024px;
  }
}

</style>
