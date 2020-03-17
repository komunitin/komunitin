<template>
  <q-layout view="hhh lpr fff" class="home column justify-start items-center">
    <q-header class="bg-transparent">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          color="white"
          icon="arrow_back"
          aria-label="Home"
          @click="$router.back()"
          :class="$route.path === '/' ? 'invisible' : ''"
        />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div id="title" class="text-onoutside q-mt-md q-mb-xl">
        <h1 class="q-mb-xs q-mt-none text-center">
          <div id="welcome-to"><fit-text>{{ $t('Welcome to') }}</fit-text></div>
          <div id="komunitin"><fit-text>Komunitin</fit-text></div>
        </h1>
        <p id="slogan" class="text-subtitle1"><fit-text>{{ $t('Open System for Exchange Communities') }}</fit-text></p>
      </div>
      <router-view />
    </q-page-container>
    <q-footer class="bg-transparent q-my-md text-center text-onoutside-m">
      <selectLang @setLocale="setLocale" />
      <q-btn flat type="a" href="http://komunitin.org#help" target="__blank" label="Help"/>
      <q-btn flat type="a" href="https://github.com/komunitin/komunitin" target="__blank" label="Contribute"/>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import FitText from 'components/FitText.vue';
import selectLang from 'components/SelectLang.vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'HomeLayout',
  components: {
    selectLang,
    FitText
  },
  data() {
    return {
      tab: 'languages',
      // Current language.
      locale: this.$i18n.locale
    };
  },
  methods: {
    // Define language selected by the user and save in LocalStorage.
    // @args locale: Select language.
    setLocale(locale: string): void {
      // Change Vue-i18n locale
      this.$i18n.locale = locale;
      localStorage.setItem('lang', locale);

      // Load lang of Quasar.
      import(`quasar/lang/${locale}`).then(({ default: messages }) => {
        this.$q.lang.set(messages);
      });
      console.log(this.$router.currentRoute.path);
    }
  }
});
</script>
<style lang="scss" scope>
// Set the background image for home page
.home {
  background: $outside url('~assets/home_background-700.jpg') center top no-repeat fixed;
  background-size: cover;
}
// Set teh width of "Welcom to..." div so text can fit in it using the 'vue-resize-text' module.
#title {
  width: 328px;
}
// Adjust the size of 'Welcome to' text so it is full-width.
#welcome-to {
  font-weight: 300;
  line-height: 72px; 
}
// Adjust the size of 'Komunitin' text so it is full-width and bold.
#komunitin {
  font-weight: 500;
  line-height: 72px;
}
// Adjust the size of slogan text so it is full-width.
#slogan {
  font-style: italic;
}


</style>
