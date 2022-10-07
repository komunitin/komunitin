import { boot } from "quasar/wrappers";
import {createI18n, useI18n} from "vue-i18n";
import DefaultMessages from "src/i18n/en-us/index.json";
import langs from "src/i18n";
import { LocalStorage, QVueGlobals, useQuasar } from "quasar";
import { formatRelative, Locale } from "date-fns";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $formatDate: (date: string) => string;
    $setLocale: (locale: string) => Promise<void>;
  }
}

/**
 * Default to english language.
 */
const DEFAULT_LANG = "en-US";
/**
 * LocalStorage key for the saved locale.
 */
const LOCALE_KEY = "lang";

/**
 * THe current date locale.
 */
let dateLocale = undefined as Locale | undefined;

/**
 * Return locale if it is a defined language for this app,
 * or the default language code (English) instead.
 * **/
function normalizeLocale(locale: string): string {
  return (locale in langs) ? locale : DEFAULT_LANG;
}

/**
 * Return the user locale based on previous session or browser.
 */
function getCurrentLocale($q: QVueGlobals): string {
  // Option 1: Locale saved in LocalStorage from previous session.
  const savedLang = LocalStorage.getItem(LOCALE_KEY);
  if (savedLang !== null) {
    return savedLang as string;
  }
  // Option 2: Use browser language if supported.
  const quasarLang = $q.lang.getLocale() ?? DEFAULT_LANG;
  return normalizeLocale(quasarLang);
}

// Set VueI18n lang.
async function setI18nLocale(locale: string) {
  const i18n = useI18n()
  if (i18n.locale.value !== locale) {
    const messages = (await import(`src/i18n/${locale}`)).default;
    i18n.setLocaleMessage(locale, messages);
    i18n.locale.value = locale;
  }
}

// Set Quasar lang.
async function setQuasarLang($q: QVueGlobals, lang: string) {
  const messages = (await import(`quasar/lang/${lang}`)).default;
  $q.lang.set(messages);
}

async function setDateLocale(locale: string) {
  if (locale.includes("-")) {
    locale = locale.split("-",2).map((value, index) => (index > 0 ? value.toUpperCase() : value)).join("-");
  }
  dateLocale = (await import(`date-fns/locale/${locale}/index.js`)).default;
}
/**
 * Asynchronously sets the current locale.
 * **/
async function setLocale($q: QVueGlobals, locale: string) {
  const lang = normalizeLocale(locale);
  await Promise.all([
    setI18nLocale(lang),
    setQuasarLang($q, lang),
    setDateLocale(lang)
  ]);
  localStorage.setItem(LOCALE_KEY, locale);
}

// Default export for Quasar boot files.
export default boot(async ({ app }) => {
  const i18n = createI18n({
    locale: DEFAULT_LANG,
    fallbackLocale: DEFAULT_LANG,
    messages: {
      [DEFAULT_LANG]: DefaultMessages
    }
  });
  // Install 'vue-i18n' plugin.
  app.use(i18n);

  // Get Quasar from the Vue constructor prototype.
  const $q = useQuasar();
  // Set current locale.
  await setLocale($q, getCurrentLocale($q));

  // Add setLocale function to Vue prototype.
  app.config.globalProperties.$setLocale = async function(locale: string) {
    // Get Quasar from this Vue instance.
    await setLocale(this.$q, locale);
  };

  // Add date filter to Vue.
  app.config.globalProperties.$formatDate = (date: string) =>
    formatRelative(new Date(date), new Date(), {
      locale: dateLocale
    })
});

