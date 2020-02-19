<template>
  <q-layout view="lHh Lpr lFf">
    <q-toolbar v-if="$router.currentRoute.path !== '/'">
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

    <q-page-container>
      <div class="home main">
        <div v-if="$router.currentRoute.path == '/'" class="home-title">
          <h1>
            Wellcome to
            <br />
            <span>Komunitin</span>
          </h1>
          <h6>Open System for Exchange Communities</h6>
        </div>
        <router-view />
      </div>

      <footer class="bg-transparent text-primary">
        <q-tabs
          no-caps
          active-color="primary"
          indicator-color="transparent"
          class="text-grey"
          v-model="tab"
        >
          <q-route-tab to="/languages" name="languages" label="Languages" />
          <q-route-tab to="/help" name="help" label="Help" />
          <q-route-tab to="contribute" name="contribute" label="Contribute" />
        </q-tabs>
      </footer>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'HomeLayout',
  data() {
    return {
      tab: 'languages'
    };
  }
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
footer {
  color: rgba(255, 255, 255, 0.74);
  padding-top: 20px;
  text-align: center;
}
.q-tab__label {
  font-weight: normal;
}
</style>
