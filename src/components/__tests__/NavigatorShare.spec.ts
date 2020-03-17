import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import NavigatorShare from '../NavigatorShare.vue';
import { Quasar } from 'quasar';

describe('NavigatorShare', () => {
  let url: string;
  let title: string;
  let onError: Function;
  let wrapper: Wrapper<NavigatorShare>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {}
  });

  let ErrorText: string;

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    url = 'https://example.com';
    title = 'Example Title';
    onError = function(e: string) {
      // console.log(e);
      ErrorText = e;
    };
    wrapper = shallowMount(NavigatorShare, {
      propsData: {
        url: url,
        title: title,
        onError: onError
      },
      localVue
    });
  });

  it('Html generated', () => {
    // console.debug({ Test: wrapper.html() });
    expect(wrapper.html()).toContain('<p>Share</p>');
  });

  it('Generate error', () => {
    wrapper.find('p').trigger('click');
    // console.debug({ Test: ErrorText });
    expect(ErrorText).toEqual('method not supported');
  });
});
