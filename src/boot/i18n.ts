import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';
import Quasar from 'quasar';

Vue.use(VueI18n);

/**
 * Idioma por defecto.
 */
let lang = 'en-us';

/// Si tenemos idioma en localStorage lo recogemos.
if (localStorage.getItem('lang')) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  lang = localStorage.getItem('lang');
} else {
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
