<template>
  <div class="home-body">
  <div class="home-center">
    <div class="home-title">
      <h1>
        {{ $t('Welcome to') }}
        <br />
        <span>Komunitin</span>
      </h1>
      <h6>{{ $t('Open System for Exchange Communities') }}</h6>
    </div>
    <div id="login-home">
      <q-btn
        color="primary"
        text-color="onprimary"
        :label="$t('Find your local exchange')"
        icon="explore"
        :to="{ name: 'ExchangesListPage' }"
      />
      <p class="home-text">{{ $t('Already registered to a local exchange?') }}</p>
      <q-btn
        outline
        color="transparent"
        text-color="onprimary"
        :label="$t('Login')"
        :to="{ name: 'LoginSelect' }"
        icon="account_circle"
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
.home-title {
  margin: 30px 0;
}
.home-title h1 {
  font-family: roboto;
  font-size: 40px;
  text-align: center;
  margin: 35px 0 0 0;
  line-height: 49px;
}
.home-title h1 span {
  font-weight: bold;
  font-size: 46px;
}
.home-title h6 {
  font-family: roboto;
  font-style: italic;
  text-align: center;
  font-size: 11px;
  margin: 0;
}
.home-body .q-btn {
  width: 300px;
}
.home-text {
  color: $onprimary-medium;
  margin: 16px 0 4px 0;
}
</style>


