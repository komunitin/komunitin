<template>
  <div id="login-select">
    <q-btn color="white" text-color="black">
      <q-avatar size="18px">
        <img src="~assets/icons/google.png" />
      </q-avatar>
      <div>{{ $t('Login width google') }}</div>
    </q-btn>
    <q-btn color="white" text-color="black">
      <q-avatar left size="18px">
        <img src="~assets/icons/facebook.png" />
      </q-avatar>
      <div>{{ $t('Login width facebook') }}</div>
    </q-btn>
    <q-btn color="white" text-color="black" :to="{ name: 'LoginMail' }">
      <q-avatar left size="18px">
        <img src="https://img.icons8.com/material-sharp/24/000000/important-mail.png" />
      </q-avatar>
      <div>{{ $t('Login width mail') }}</div>
    </q-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// Login select.
export default Vue.extend({
  name: 'LoginSelect'
});
</script>
<style>
#login-select {
  width: 300px;
  display: inline-block;
}
#login-select .q-avatar__content {
  margin-left: -8px;
}
</style>
