<template>
  <q-layout view="hhh lpr fff" class="home column justify-start items-center">
    <q-header class="bg-transparent">
      <q-toolbar>
        <q-btn v-show="showBackButton" id="back" flat dense round color="onoutside" icon="arrow_back"
          :aria-label="$t('Back')"
          @click="goBack"
        />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div id="title" class="text-onoutside q-mt-md q-mb-xl">
        <h1 class="q-mb-xs q-mt-none text-center">
          <div id="welcome-to"><fit-text>{{ $t('welcomeTo') }}</fit-text></div>
          <div id="komunitin"><fit-text>Komunitin</fit-text></div>
        </h1>
        <p id="slogan" class="text-subtitle1"><fit-text>{{ $t('openSystemForGroupCommunities') }}</fit-text></p>
      </div>
      <router-view />
    </q-page-container>
    <q-footer class="bg-transparent q-my-md text-center text-onoutside-m">
      <select-lang />
      <q-btn flat type="a" href="http://komunitin.org#help" target="__blank" :label="$t('help')" />
      <q-btn flat type="a" href="https://github.com/komunitin/komunitin" target="__blank" :label="$t('contribute')" />
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import FitText from '../components/FitText.vue';
import selectLang from '../components/SelectLang.vue';

/**
 * Layout base con menú lateral.
 */
export default Vue.extend({
  name: 'Front',
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
  computed: {
    showBackButton(): boolean {
      return (this.$route.path !== "/");
    }
  },
  methods: {
    goBack() {
      this.$router.back();
    }
  }
});
</script>
<style lang="scss" scope>
// Set the background image for home page
.home {
  background: $outside url('~assets/home_background-700.jpg') center
    no-repeat fixed;
  background-size: cover;
}
// Set the width of "Welcom to..." div so text can fit in it using the 'vue-resize-text' module.
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
