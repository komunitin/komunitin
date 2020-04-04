import Vue from 'vue';
import AuthPlugin, {Auth} from '../plugins/Auth';

Vue.use(AuthPlugin);

declare module "vue/types/vue" {
  interface Vue {
    $auth: Auth;
  }
}