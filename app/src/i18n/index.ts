/**
 * List of defined languages for the app and their full native name.
 * 
 * Here we don't import the full list of all lang messages, since this may grow a lot 
 * and we anynchronously load them in i18n boot file.
 */

import { Locale } from "date-fns"
import { QuasarLanguage } from "quasar"

export interface LocaleDefinition {
  label: string,
  loadMessages: () => Promise<never>,
  loadQuasar: () => Promise<QuasarLanguage>,
  loadDateFNS: () => Promise<Locale>
}

const langs = {
  "ca": {
    label: "Català",
    loadMessages: async () => (await import("src/i18n/ca/index.json")).default,
    loadQuasar: async () => (await import("quasar/lang/ca")).default,
    loadDateFNS: async () => (await import(`date-fns/locale/ca/index.js`)).default
  },
  "en-us": {
    label: "English",
    loadMessages: async () => (await import("src/i18n/en-us/index.json")).default,
    loadQuasar: async () => (await import("quasar/lang/en-US")).default,
    loadDateFNS: async () => (await import(`date-fns/locale/en-US/index.js`)).default
  },
  "es": {
    label: "Español",
    loadMessages: async () => (await import("src/i18n/es/index.json")).default,
    loadQuasar: async () => (await import("quasar/lang/es")).default,
    loadDateFNS: async () => (await import(`date-fns/locale/es/index.js`)).default
  }
}
export type LangName = keyof typeof langs
export default langs as Record<LangName, LocaleDefinition>


