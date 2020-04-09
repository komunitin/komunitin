
import LoginMail from '../LoginMail.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import { Quasar, QBtn, QInput, QIcon } from 'quasar';
import Auth from '../../../plugins/Auth';
import KOptions from '../../../boot/komunitin';
import { LocalStorage, Notify } from "quasar";
import Vuelidate from 'vuelidate';
// Enable mirage. Don't know how to do it otherwise.
process.env.USE_MIRAGE = "0";
import '../../../services/mirage';


describe('LoginMail.vue', () => {
  const localVue = createLocalVue();
  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QBtn, QInput, QIcon },
    plugins: {LocalStorage, Notify},
  });
  localVue.use(Auth, {
    clientId: KOptions.apis.auth.clientId,
    tokenEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.token,
    userInfoEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo
  });
  localVue.use(Vuelidate);

  const wrapper = mount(LoginMail, {
    localVue,
    attachToDocument: true,
    mocks: {
      // Mocking translate function since I was unable to properly 
      // use the 'vue-i18n' module here.
      $t: (id: string) => id,
    }
  });

  test('Login', async () => {
    // Mock $q.notify since it has dependencies not loaded in jest environment.
    wrapper.vm.$q.notify = jest.fn();
    expect(wrapper.vm.$auth.isAuthorized()).toBe(false);
    expect(wrapper.find("button").attributes().disabled).toBe("disabled");
    wrapper.find("input[type='email']").setValue("example@example.com");
    wrapper.find("input[type='password']").setValue("password");
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").attributes().disabled).toBeUndefined();
    wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();
    // Wait for the axios/miragejs mock request promises.
    await new Promise(r => setTimeout(r, 10));
  });
  // Need to be called sice we've added the wrapper to the document.
  afterAll(() => wrapper.destroy());

});
