<template>
  <div class="column q-gutter-lg">
    <q-btn
      id="login_google"
      color="surface"
      text-color="onsurface-m"
      icon="img:statics/icons/google.png"
      :label="$t('loginWithGoogle')"
    />
    <q-btn
      id="login_facebook"
      color="surface"
      text-color="onsurface-m"
      icon="img:statics/icons/facebook.png"
      :label="$t('loginWithFacebook')"
    />
    <q-btn
      id="login_mail"
      color="surface"
      text-color="onsurface-m"
      icon="mail"
      :label="$t('loginWithMail')"
      :to="{ name: 'LoginMail' }"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

// Login select.
export default Vue.extend({
  name: "LoginSelect"
});
</script>
<style scope></style>
