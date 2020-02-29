<template>
  <q-select
    class="gray-kn"
    flat
    dense
    round
    outlined
    @input="setLocale"
    v-model="locale"
    display-value="Languages"
    emit-value
    map-options
    :options="langs"
  />
</template>
<!--
-->
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'selectLang',
  data() {
    return {
      locale: this.$i18n.locale,
      // Available languages.
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      langs: this.$Koptions.langs as any
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
