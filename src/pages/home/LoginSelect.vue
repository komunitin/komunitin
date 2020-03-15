<template>
  <div class="column q-gutter-lg">
    <q-btn color="surface" text-color="onsurface-m" 
      icon="img:statics/icons/google.png"
      :label="$t('Login with Google')"
    />
    <q-btn color="surface" text-color="onsurface-m"
      icon="img:statics/icons/facebook.png"
      :label="$t('Login with Facebook')"
    />
    <q-btn color="surface" text-color="onsurface-m"
      icon="mail" 
      :label="$t('Login with mail')"
      :to="{ name: 'LoginMail' }"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// Login select.
export default Vue.extend({
  name: 'LoginSelect'
});
</script>
