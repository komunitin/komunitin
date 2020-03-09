import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import SearchBar from '../SearchBar.vue';
import { Quasar, QBtn, QToolbar, QToolbarTitle, QInput } from 'quasar';

describe('SearchBox.vue', () => {
  let title: string;
  let backButton: boolean;
  let wrapper: Wrapper<SearchBar>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QBtn, QToolbar, QToolbarTitle, QInput }
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    title = 'Test Title';
    backButton = false;
    // newSearch = (e: string) => {
    //   console.debug(e);
    // };
    const onClick = jest.fn();
    wrapper = shallowMount(SearchBar, {
      propsData: {
        title: title,
        backButton: backButton
      },
      // Avoid error with translations.
      mocks: {
        $t: () => 'Title Mock Text'
      },
      localVue,
      listeners: {
        click: onClick
      }
    });
  });

  it('should have a prop named title', () => {
    expect(wrapper.props('title')).toBe(title);
    expect(wrapper.vm.$data.viewSearch).toBe(false);
  });

  it('should have a prop viewSearch', () => {
    wrapper.vm
      .$nextTick()
      .then(() => {
        const button = wrapper.find('#button_search');
        button.trigger('click');
      })
      .then(() => {
        expect(wrapper.vm.$data.viewSearch).toBe(true);
        const input = wrapper.find('input');
        input.setValue('Search text');
        input.trigger('keyup.enter');
        expect(wrapper.emitted().newSearch).toBeTruthy();
      });
  });
});
