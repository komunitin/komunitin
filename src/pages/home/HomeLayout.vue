<template>
  <q-layout view="lHh Lpr lFf" class="home">
    <q-page-container>
      <router-view />
    </q-page-container>

    <footer reveal elevated class="bg-transparent gray-kn">
      <q-tabs
        dense
        no-caps
        active-color="primary"
        indicator-color="transparent"
        class="gray-kn"
        v-model="tab"
      >
        <q-tab to="/languages" name="languages">
          <selectLang @setLocale="setLocale" />
        </q-tab>
        <q-route-tab to="/help" name="help" label="Help" />
        <q-route-tab to="contribute" name="contribute" label="Contribute" />
      </q-tabs>
    </footer>
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
<style scope>
.home {
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
  color: white !important;
}
.gray-kn {
  color: rgba(255, 255, 255, 0.74);
}
footer {
  color: rgba(255, 255, 255, 0.74);
  padding-top: 20px;
  text-align: center;
}

.q-page-container {
  min-height: 400px;
}
.q-tab__label {
  font-weight: normal;
}
.q-field--auto-height.q-field--dense.q-field--labeled
  .q-field__control-container {
  padding-top: 0;
}

#q-app .q-field__native.row.items-center,
.q-select__dropdown-icon.material-icons.q-icon.notranslate {
  color: rgba(255, 255, 255, 0.74);
}
.q-item {
  color: black;
}
.q-item--active {
  color: gray !important;
}
.q-tab__content.self-stretch.flex-center.relative-position.q-anchor--skip.non-selectable.column {
  text-transform: uppercase;
}
</style>
