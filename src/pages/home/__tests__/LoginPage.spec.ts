import { createLocalVue, shallowMount } from '@vue/test-utils';
import LoginPage from '../LoginPage.vue';
import { Quasar, QBtn } from 'quasar';

describe('LoginPage.vue', () => {
  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, { components: { QBtn } });

  // Shallow Mount means that the child components are not mounted,
  // but placeholder components are used instead.
  const wrapper = shallowMount(LoginPage, {
    // Avoid error with translations.
    mocks: {
      $t: () => 'Mock text'
    },
    localVue
  });

  // @todo Cuando tengamos los enlaces comprobar sobre ellos.
  test('Find links', () => {
    // expect(wrapper.html()).toContain('<span>Komunitin</span>');
    expect(wrapper.html()).toContain('icon="account_circle"');
  });
});
