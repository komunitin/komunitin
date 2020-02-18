<template>
  <div id="login-mail">
    <q-btn
      outline
      color="transparent"
      text-color="white"
      :label="$t('Login')"
      icon="account_circle"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// Login mail.
export default Vue.extend({
  name: 'LoginMailt'
});
</script>
