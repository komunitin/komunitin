<template>
  <div>
    <q-btn
      id="explore"
      unelevated
      color="primary"
      text-color="onprimary"
      :label="$t('Find your local group')"
      icon="explore"
      :to="{ name: 'GroupsListPage' }"
      class="full-width"
    />
    <p class="text-onoutside-m q-mt-md q-mb-xs">{{ $t('Already registered to a local group?') }}</p>
    <q-btn
      outline
      color="transparent"
      text-color="onoutside"
      :label="$t('Login')"
      :to="{ name: 'LoginSelect' }"
      icon="account_circle"
      class="full-width"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Login select.
 *
 * @todo Login con google o facebook.
 */
export default Vue.extend({
  name: 'LoginPage'
});
</script>
<style lang="scss" scope>
// Wider non-standard button.
#explore {
  height: 48px;
}
</style>


