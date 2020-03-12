<template>
  <q-layout view="lHh Lpr lFf" class="home">
    <q-page-container>
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
import selectLang from 'components/SelectLang.vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'HomeLayout',
  components: {
    selectLang
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
.home {
  background: $outside url('~assets/home_background-700.jpg') center top no-repeat fixed;
  background-size: cover;
}


</style>
