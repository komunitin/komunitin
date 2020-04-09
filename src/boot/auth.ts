import Vue from 'vue';
import AuthPlugin, {Auth} from '../plugins/Auth';
import KOptions from './komunitin';

Vue.use(AuthPlugin, {
  clientId: KOptions.apis.auth.clientId,
  tokenEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.token,
  userInfoEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo
});

declare module "vue/types/vue" {
  interface Vue {
    $auth: Auth;
  }
}