<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="home">
        <div class="home-title">
          <h1>
            Wellcome to
            <br />
            <span>Komunitin</span>
          </h1>
          <h6>Open System for Exchange Communities</h6>
        </div>
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'HomeLayout'
});
</script>
<style scope>
body {
  background: rgba(221, 75, 57, 0.3) url('~assets/home_background-700.jpg')
    no-repeat center center fixed;
  background-size: cover;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.5) 100%
    ),
    url('~assets/home_background-700.jpg');
}
.home-title {
  margin: 70px 0;
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
.home {
  color: white;
  text-align: center;
}

.home .q-btn {
  width: 300px;
  margin: 10px 0;
}
.home p {
  margin-top: 24px;
  text-align: left;
  width: 300px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0;

  /* 03. On Primary / Medium Emphasis */

  color: rgba(255, 255, 255, 0.74);
  mix-blend-mode: normal;
}
</style>