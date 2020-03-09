import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import SearchBar from '../SearchBar.vue';
import { Quasar, QBtn, QToolbar, QToolbarTitle, QInput } from 'quasar';

describe('SearchBox', () => {
  let title: string;
  let backButton: boolean;
  // @ts-ignore
  let wrapper: Wrapper<SearchBar>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QBtn, QToolbar, QToolbarTitle, QInput }
  });

  beforeEach(() => {
    title = 'Test Title';
    backButton = false;

    wrapper = mount(SearchBar, {
      propsData: {
        title: title,
        backButton: backButton
      },
      // Avoid error with translations.
      mocks: {
        $t: () => 'Title Mock Text'
      },
      localVue
    });
  });

  it('should have a prop named title', () => {
    expect(wrapper.props('title')).toBe(title);
    expect(wrapper.vm.$data.viewSearch).toBe(false);
  });

  it('should have a prop viewSearch', async () => {
    const button = wrapper.find('#button_search');
    button.trigger('click');
    await wrapper.vm.$nextTick();
    // console.log({ viewSearch: wrapper.vm.$data.viewSearch });
    // console.log({ Html: wrapper.html() });
    const input = wrapper.find('input');
    input.setValue('Search text');
    input.trigger('keyup.enter');
    expect(wrapper.emitted().newSearch).toBeTruthy();
  });
});
