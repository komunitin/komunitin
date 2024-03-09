import { boot } from "quasar/wrappers";
import VueGtagPlugin from "vue-gtag";
import { KOptions } from "./koptions";

/**
 * Add Google Tag to the app so it can send anonymous events to Google Analytics.
 */
export default boot(({app, router}) => {
  const gtagId = KOptions.gtag.id;
  if (gtagId) {
    app.use(VueGtagPlugin, {
      config: { id: gtagId },
    }, router);
  }
})
