import Vue from "vue";
import { boot } from 'quasar/wrappers'
import VueI18n from "vue-i18n";
import DefaultMessages from 'src/i18n/en-us';

// Install 'vue-i18n' plugin.
Vue.use(VueI18n);

/**
 * Default to english language.
 */
const DEFAULT_LANG = "en-us";
/** 
 * LocalStorage key for the saved locale.
 */
const LOCALE_KEY = "lang";

/** 
 * VueI18n instance with default locale preloaded.
 */
export const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  messages: {
    [DEFAULT_LANG] : DefaultMessages
  }    
});

/**
 * Return locale if it is a defined language for this app, 
 * or the default language code (English) instead.
 * **/
function normalizeLocale(locale: string) : string {
  return Vue.prototype.$Koptions.langs.reduce(
    (lang: string, elem: {label: string, value: string}) => {
      return elem.value === locale ? locale : lang
    }, DEFAULT_LANG); 
}

/**
 * Return the user locale based on previous session or browser.
 */
function getCurrentLocale() {
  // Option 1: Locale saved in LocalStorage from previous session.
  const savedLang = localStorage.getItem(LOCALE_KEY);
  if (savedLang !== null) {
    return savedLang;
  }
  // Option 2: Use browser language if supported.
  const quasarLang = Vue.prototype.$q.lang.getLocale();
  return normalizeLocale(quasarLang);
}

// Set VueI18n lang.
async function setI18nLocale(locale: string) {
  if (i18n.locale !== locale) {
    const messages = (await import(`src/i18n/${locale}`)).default;
    i18n.setLocaleMessage(locale, messages)
    i18n.locale = locale;
  }
}

// Set Quasar lang.
async function setQuasarLang(lang: string) {
  const messages = (await import(`quasar/lang/${lang}`)).default;
  Vue.prototype.$q.lang.set(messages);
}

/**
 * Asynchronously sets the current locale.
 * **/
export async function setLocale(locale: string) {
  const lang = normalizeLocale(locale);
  setI18nLocale(lang);
  setQuasarLang(lang);
  localStorage.setItem(LOCALE_KEY, locale);
}

// Default export for Quasar boot files.
export default boot(async ({ app }) => {
  app.i18n = i18n;
  setLocale(getCurrentLocale());
});
