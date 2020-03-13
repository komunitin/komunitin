import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import SocialButtons from '../SocialButtons.vue';
import { Quasar } from 'quasar';

describe('SocialButtons', () => {
  let url: string;
  let title: string;
  // @ts-ignore
  let wrapper: Wrapper<SocialButtons>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {}
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    url = 'https://example.com';
    title = 'Example Title';
    wrapper = shallowMount(SocialButtons, {
      propsData: {
        url: url,
        title: title
      },
      localVue
    });
  });

  it('Html generated', async () => {
    await wrapper.vm.$nextTick();
    // console.debug({ Test: wrapper.html() });
    expect(wrapper.html()).toContain(
      'title="Example Title" url="https://example.com"'
    );
  });
});
