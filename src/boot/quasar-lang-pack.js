// for when you don't specify quasar.conf.js > framework: 'all'
import { Quasar } from 'quasar'
// OTHERWISE:
// import Quasar from 'quasar'

export default async () => {

  // Idioma por defecto.
  var current_language = 'en-us';

  // Si tenemos idioma en localStorage lo recofemos.
  if ( localStorage.getItem('lang') ) {
    current_language = localStorage.getItem('lang');
  }

  const langIso = current_language

  try {
    await import(
      /* webpackInclude: /(de|en-us)\.js$/ */
      `quasar/lang/${langIso}`
      )
      .then(lang => {
        Quasar.lang.set(lang.default)
      })
  }
  catch (err) {
    // https://github.com/quasarframework/quasar/tree/dev/ui/lang
    console.log('Requested Quasar Language Pack [' + langIso + '] does not exist');
  }
}
