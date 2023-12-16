import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import DefaultMessages from "src/i18n/en-us/index.json";
import langs, {LangName} from "src/i18n";
import { QVueGlobals } from "quasar";
import LocalStorage from "../plugins/LocalStorage";
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
const DEFAULT_LANG = "en-us";
/**
 * LocalStorage key for the saved locale.
 */
const LOCALE_KEY = "lang";

/**
 * Export vue-i18 instance for use outside components.
 */
export const i18n = createI18n({
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  messages: {
    [DEFAULT_LANG as string]: DefaultMessages
  },
  legacy: false
});

/**
 * THe current date locale.
 */
let dateLocale = undefined as Locale | undefined;

/**
 * Return the date-fns Locale object for other operations than formatDate.
 */
export const getDateLocale = () => dateLocale;

/**
 * Return locale if it is a defined language for this app,
 * or the default language code (English) instead.
 * **/
function normalizeLocale(locale: string): LangName {
  return (locale in langs) ? locale as LangName : DEFAULT_LANG;
}

/**
 * Return the user locale based on previous session or browser.
 */
async function getCurrentLocale($q: QVueGlobals) {
  // Option 1: Locale saved in LocalStorage from previous session.
  const savedLang = await LocalStorage.getItem(LOCALE_KEY);
  if (savedLang !== null) {
    return savedLang as string;
  }
  // Option 2: Use browser language if supported.
  const quasarLang = $q.lang.getLocale() ?? DEFAULT_LANG;
  return normalizeLocale(quasarLang);
}

// Default export for Quasar boot files.
export default boot(async ({ app, store }) => {
  // Install 'vue-i18n' plugin.
  app.use(i18n);
  
  /**
   * Asynchronously sets the current locale.
   * **/  
  app.config.globalProperties.$setLocale = async function(locale: string) {
    // Set VueI18n lang.
    const setI18nLocale = async (locale: LangName) => {
      if (i18n.global.locale.value !== locale) {
        const definition = langs[locale]
        const messages = await definition.loadMessages();
        i18n.global.setLocaleMessage(locale, messages);
        i18n.global.locale.value = locale;
      }
    }

    // Set Quasar lang.
    const setQuasarLang = async (locale: LangName) => {
      const messages = await langs[locale].loadQuasar()
      this.$q.lang.set(messages);
    }

    // Set date-fns lang.
    const setDateLocale = async (locale: LangName) => {
      dateLocale = await langs[locale].loadDateFNS()
    }

    const lang = normalizeLocale(locale);
    store.commit("lang", lang)
    
    await Promise.all([
      setI18nLocale(lang),
      setQuasarLang(lang),
      setDateLocale(lang),
      LocalStorage.set(LOCALE_KEY, locale)
    ]);
  };

  // Add date filter to Vue.
  app.config.globalProperties.$formatDate = (date: string) =>
    formatRelative(new Date(date), new Date(), {
      locale: dateLocale
    })

  // Initially set the current locale.
  const locale = await getCurrentLocale(app.config.globalProperties.$q)
  app.config.globalProperties.$setLocale(locale);
});

