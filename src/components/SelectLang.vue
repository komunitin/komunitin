<template>
  <q-select
    class="gray-kn"
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
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'selectLang',
  data() {
    return {
      locale: this.$i18n.locale,
      // Idiomas disponibles.
      // @todo Add in global setting.
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
      this.$emit('setLocale', locale);
    }
  }
});
</script>
