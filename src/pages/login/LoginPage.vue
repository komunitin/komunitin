<template>
  <div id="login-home">
    <q-btn
      color="primary"
      text-color="white"
      :label="$t('Find your local exchange')"
      icon="explore"
      :to="{ name: 'ExchangesListPage' }"
    />
    <p>Already registered to a local exchange?</p>

    <q-btn
      outline
      color="transparent"
      text-color="white"
      :label="$t('Login')"
      :to="{ name: 'LoginSelect' }"
      icon="account_circle"
    />
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


