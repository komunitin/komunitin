import KOptions from "src/komunitin.json";
import { boot } from "quasar/wrappers";

declare module "vue/types/vue" {
  interface Vue {
    $KOptions: typeof KOptions;
  }
}

// For use outside Vue components.
export { KOptions };

export default boot(({ Vue }) => {
  // Augment Vue interface with $KOptions member.
  Vue.prototype.$KOptions = KOptions;
});
