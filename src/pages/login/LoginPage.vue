<template>
  <div class="home">
    <h1>
      Wellcome to
      <br />
      <span>Komunitin</span>
    </h1>
    <h6>Open System for Exchange Communities</h6>

    <div id="home-login">
      <q-btn
        color="primary"
        text-color="white"
        :label="$t('Find your local exchange')"
        icon="explore"
      />
      <p>Already registered to a local exchange?</p>

      <q-btn
        outline
        color="transparent"
        text-color="white"
        :label="$t('Login')"
        icon="account_circle"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Login.
@Component
export default class LoginPage extends Vue {}
</script>
<style>
.home h1 {
  font-family: roboto;
  color: white;
  font-size: 40px;
  text-align: center;
  margin: 35px 0 0 0;
  line-height: 49px;
}
.home h1 span {
  font-weight: bold;
  font-size: 46px;
}
.home h6 {
  font-family: roboto;
  font-style: italic;
  color: white;
  text-align: center;
  font-size: 11px;
  margin: 0;
}
#home-login {
  color: white;
  text-align: center;
  margin: 70px 0;
}

#home-login button {
  width: 300px;
}
#home-login p {
  margin-top: 24px;
  text-align: left;
  width: 300px;
  margin-left: auto;
  margin-right: auto;

  /* 03. On Primary / Medium Emphasis */

  color: rgba(255, 255, 255, 0.74);
  mix-blend-mode: normal;
}
</style>

