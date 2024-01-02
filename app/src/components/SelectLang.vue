<template>
  <!-- Don't translate the word "Language" since it will probably be better understood by the user seeking for this option rather than the translated word to a language that the user wants to change. -->
  <q-btn-dropdown
    flat
    label="Language"
  >
    <q-list>
      <q-item
        v-for="(item, lang) in langs"
        :key="lang"
        :ref="lang"
        v-close-popup
        clickable
        @click="changeLanguage(lang)"
      >
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
<script setup lang="ts">
import langs from "../i18n";
import { useLocale } from "../boot/i18n"

const emit = defineEmits<{
  (e: "language-change", locale: string): void
}>();

const locale = useLocale();
const changeLanguage = async (lang: string) => {
  locale.value = lang
  emit("language-change", lang)
}

</script>
