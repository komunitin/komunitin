import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';

Vue.use(VueI18n);

/**
 * Idioma por defecto.
 * @todo Recoger idioma definido en el dispositivo.
 */
let lang = 'en-us';

/// Si tenemos idioma en localStorage lo recogemos.
if (localStorage.getItem('lang')) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  lang = localStorage.getItem('lang');
}

console.log({ localStorage: localStorage });

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
