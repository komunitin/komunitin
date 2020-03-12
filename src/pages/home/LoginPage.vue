<template>
  <div class="home-body">
  <div class="home-center">
    <div class="text-onoutside">
      <h1 class="q-mb-xs">
        <div id="welcome-to">{{ $t('Welcome to') }}</div>
        <div id="komunitin">Komunitin</div>
      </h1>
      <p id="slogan" class="text-subtitle1">{{ $t('Open System for Exchange Communities') }}</p>
    </div>
    <div id="login-home">
      <q-btn
        unelevated
        color="primary"
        text-color="onprimary"
        :label="$t('Find your local exchange')"
        icon="explore"
        :to="{ name: 'ExchangesListPage' }"
        class="full-width q-mt-xl"
        id="explore"
      />
      <p class="text-onoutside-m q-mt-md q-mb-xs">{{ $t('Already registered to a local exchange?') }}</p>
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
  </div>
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

#welcome-to {
  font-weight: 300;
  font-size: 4.1rem;
  line-height: 4.1rem;
}

#komunitin {
  font-weight: 500;
  font-size: 4.65rem;
  line-height: 4.65rem;
}

#slogan {
  font-style: italic;
  font-size: 1.09rem;
}

#explore {
  height: 48px;
}
</style>


