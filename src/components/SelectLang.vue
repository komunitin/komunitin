<template>
  <!-- Don't translate the word "Language" since it will probably be better understood by the user seeking for this option rather than the translated word to a language that the user wants to change. -->
  <q-btn-dropdown flat label="Language">
    <q-list>
      <q-item
        v-for="lang in langs"
        :key="lang.value"
        :ref="lang.value"
        v-close-popup
        clickable
        @click="changeLanguage(lang.value)"
      >
        <q-item-section>
          <q-item-label>{{ lang.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SelectLang",
  data() {
    return {
      locale: this.$i18n.locale,
      // Available languages.
      langs: this.$KOptions.langs
    };
  },
  methods: {
    /**
     * Define language selected by the user and save in LocalStorage.
     * @arg locale: Selected language key.
     */
    async changeLanguage(locale: string) {
      await this.$setLocale(locale);
      this.$emit("language-change", locale);
    }
  }
});
</script>
