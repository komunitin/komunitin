import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import SimpleMap from '../SimpleMap.vue';
import { Quasar } from 'quasar';

describe('SimpleMap', () => {
  let center: [number, number];
  let markerLatLng: [number, number];
  // @ts-ignore
  let wrapper: Wrapper<SimpleMap>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {}
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    // center = [41.5922793, 1.8342942];
    // markerLatLng = [41.5922793, 1.8342942];
    wrapper = shallowMount(SimpleMap, {
      propsData: {
        center: center,
        markerLatLng: markerLatLng
      },
      localVue
    });
  });

  it('Html generated', async () => {
    await wrapper.vm.$nextTick();
    // console.debug({ Test: wrapper.html() });
    expect(wrapper.html()).toContain('l-map-stub');
  });
});
