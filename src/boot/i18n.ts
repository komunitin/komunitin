import Vue from 'vue';
import Quasar from 'quasar';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';

Vue.use(VueI18n);

/**
 * Default language.
 */
let lang = 'en-us' as string;

// If there is language in localStorage it is used.
if (localStorage.getItem('lang')) {
  // @ts-ignore
  lang = localStorage.getItem('lang');
} else {
  // @ts-ignore
  switch (Quasar.lang.getLocale()) {
    case 'ca': {
      lang = 'ca';
      break;
    }
    case 'es': {
      lang = 'es';
      break;
    }
    default: {
      lang = 'en-us';
      break;
    }
  }
}

const i18n = new VueI18n({
  locale: lang,
  fallbackLocale: lang,
  messages
});

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n };
