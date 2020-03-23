import Vue from 'vue';
import KOptions from 'src/komunitin.json';

/**
 * Augment Vue interface with $KOptions member.
 */
Vue.prototype.$KOptions = KOptions;

declare module 'vue/types/vue' {
  interface Vue {
    $KOptions: typeof KOptions
  }
}

export default KOptions
