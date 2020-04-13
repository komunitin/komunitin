import Vuelidate from 'vuelidate';
import { boot } from 'quasar/wrappers';

export default boot(({Vue}) => {
  Vue.use(Vuelidate);
});
