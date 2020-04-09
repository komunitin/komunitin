import { createLocalVue, mount } from '@vue/test-utils';
import Login from '../Login.vue';
import VueRouter from 'vue-router'
import getRouter from '../../../router/index';
import { Quasar, QBtn } from 'quasar';


describe('Login.vue', () => {
  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, { components: { QBtn } });
  localVue.use(VueRouter);

  // Shallow Mount means that the child components are not mounted,
  // but placeholder components are used instead.
  const wrapper = mount(Login, {
    localVue,
    router: getRouter(),
    mocks: {
      // Mocking translate function since I was unable to properly 
      // use the 'vue-i18n' module here.
      $t: (id: string) => id
    }
  });

  test('Find links', () => {
    const html = wrapper.html();
    expect(html).toContain("account_circle");
    expect(html).toContain("explore");
  });

  test("Click explore", async () => {
    // Group page makes use of window.scrollTo() that throws an error. Not a big deal,
    // but we avoid the error message with this line.
    window.scrollTo = jest.fn();
    wrapper.find("#explore").trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.path).toBe("/groups");
  });

  test("Click login", async () => {
    wrapper.find("#login").trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.path).toBe("/login-select");
  })

});
