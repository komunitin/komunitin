<template>
  <q-btn-dropdown flat label="Language">
    <q-list>
       <q-item v-for="lang in langs" :key="lang.value" clickable v-close-popup @click="setLocale(lang.value)">
          <q-item-section>
            <q-item-label>{{ lang.label }}</q-item-label>
          </q-item-section>
        </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
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
