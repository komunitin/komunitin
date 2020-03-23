import { createLocalVue, shallowMount, Wrapper } from "@vue/test-utils";
import SimpleMap from "../SimpleMap.vue";

describe("SimpleMap", () => {
  let position: [number, number];
  let wrapper: Wrapper<Vue>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    position = [41.5922793, 1.8342942];
    wrapper = shallowMount(SimpleMap, {
      propsData: {
        center: position,
        marker: position,
      },
      localVue
    });
  });

  it("Html generated", async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toContain("l-map-stub");
  });
});
