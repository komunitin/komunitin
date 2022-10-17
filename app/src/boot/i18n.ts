import { boot } from "quasar/wrappers";
import {createI18n} from "vue-i18n";
import DefaultMessages from "src/i18n/en-us/index.json";
import langs from "src/i18n";
import { LocalStorage, QVueGlobals } from "quasar";
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



// Default export for Quasar boot files.
export default boot(async ({ app }) => {
  const locale: string = DEFAULT_LANG;
  const i18n = createI18n({
    locale: locale,
    fallbackLocale: locale,
    messages: {
      [locale]: DefaultMessages
    },
    legacy: false
  });
  // Install 'vue-i18n' plugin.
  app.use(i18n);
  
  /**
   * Asynchronously sets the current locale.
   * **/  
  app.config.globalProperties.$setLocale = async function(locale: string) {
    // Set VueI18n lang.
    const setI18nLocale = async (locale: string) => {
      if (i18n.global.locale.value !== locale) {
        const messages = (await import(`src/i18n/${locale}`)).default;
        i18n.global.setLocaleMessage(locale, messages);
        i18n.global.locale.value = locale;
      }
    }

    // Set Quasar lang.
    const setQuasarLang = async ( locale: string) => {
      const messages = (await import(`quasar/lang/${locale}`)).default;
      this.$q.lang.set(messages);
    }

    const setDateLocale = async (locale: string) => {
      if (locale.includes("-")) {
        locale = locale.split("-",2).map((value, index) => (index > 0 ? value.toUpperCase() : value)).join("-");
      }
      dateLocale = (await import(`date-fns/locale/${locale}/index.js`)).default;
    }
    const lang = normalizeLocale(locale);
    await Promise.all([
      setI18nLocale(lang),
      setQuasarLang(lang),
      setDateLocale(lang)
    ]);
    localStorage.setItem(LOCALE_KEY, locale);
  };

  // Add date filter to Vue.
  app.config.globalProperties.$formatDate = (date: string) =>
    formatRelative(new Date(date), new Date(), {
      locale: dateLocale
    })

  // Initially set the current locale.
  app.config.globalProperties.$setLocale(getCurrentLocale(app.config.globalProperties.$q));
});

