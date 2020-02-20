<template>
  <div class="home-body">
    <div class="home-title">
      <h1>
        Wellcome to
        <br />
        <span>Komunitin</span>
      </h1>
      <h6>Open System for Exchange Communities</h6>
    </div>
    <div id="login-home">
      <q-btn
        color="primary"
        text-color="white"
        :label="$t('Find your local exchange')"
        icon="explore"
        :to="{ name: 'ExchangesListPage' }"
      />
      <p class="gray-kn">Already registered to a local exchange?</p>

      <q-btn
        outline
        color="transparent"
        text-color="white"
        :label="$t('Login')"
        :to="{ name: 'LoginSelect' }"
        icon="account_circle"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Login select.
 *
 * @todo Flecha atras.
 * @todo Botón de idiomas.
 * @todo Link to exchanges.
 * @todo Formulario login con mail.
 * @todo Login con google o facebook.
 */
export default Vue.extend({
  name: 'LoginPage'
});
</script>
<style scope>
.home-title {
  margin: 30px 0;
}
.home-title h1 {
  font-family: roboto;
  color: white;
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
  color: white;
  text-align: center;
  font-size: 11px;
  margin: 0;
}
</style>


