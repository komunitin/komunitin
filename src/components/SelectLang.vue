<template>
  <div>
    <q-select
      flat
      dense
      round
      outlined
      v-model="locale"
      @input="setLocale"
      emit-value
      map-options
      :options="langs"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'selectLang',
  data() {
    return {
      leftDrawerOpen: false,
      // locale: this.$q.lang.isoName,
      // locale: this.$q.lang.isoName,
      locale: this.$i18n.locale,
      // Idiomas disponibles.
      // @todo Add global conf.
      langs: [
        {
          label: 'Es',
          value: 'es'
        },
        {
          label: 'Ca',
          value: 'ca'
        },
        {
          label: 'En',
          value: 'en-us'
        }
      ]
    };
  },
  methods: {
    // Define language selected by the user and save in LocalStorage.
    // @args locale: Select language.
    setLocale(locale: string) {
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
