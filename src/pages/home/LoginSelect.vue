<template>
  <div>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        color="white"
        icon="arrow_back"
        aria-label="Home"
        @click="$router.back()"
      />
      <q-toolbar-title class="text-white">Komunitin</q-toolbar-title>
    </q-toolbar>
    <div class="home-body">
      <div class="home-center">
        <q-btn color="white" text-color="black">
          <q-avatar size="18px">
            <img src="~assets/icons/google.png" />
          </q-avatar>
          <div class="label_abatar">{{ $t('Login width google') }}</div>
        </q-btn>
        <q-btn color="white" text-color="black">
          <q-avatar left size="18px">
            <img src="~assets/icons/facebook.png" />
          </q-avatar>
          <div class="label_abatar">{{ $t('Login width facebook') }}</div>
        </q-btn>
        <q-btn color="white" text-color="black" :to="{ name: 'LoginMail' }">
          <q-avatar left size="18px">
            <img src="https://img.icons8.com/material-sharp/24/000000/important-mail.png" />
          </q-avatar>
          <div class="label_abatar">{{ $t('Login width mail') }}</div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// Login select.
export default Vue.extend({
  name: 'LoginSelect'
});
</script>
<style scope>
.home-center .q-btn {
  width: 300px;
  margin: 5px;
}
#login-select {
  width: 300px;
  display: inline-block;
}
#login-select .q-avatar__content {
  margin-left: -8px;
}
.label_abatar {
  margin-left: 6px;
}
</style>
