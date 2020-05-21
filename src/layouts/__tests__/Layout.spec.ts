import { createLocalVue, mount, Wrapper } from "@vue/test-utils";
import Vuex from "vuex";
import { Quasar, QBtn, QToolbar, QToolbarTitle, QInput, QLayout, QDrawer, QHeader, QIcon, QPageContainer } from "quasar";
import Layout from "../Layout.vue";



describe("Layout", () => {
  let wrapper: Wrapper<Vue>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();
  localVue.use(Vuex);
  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QBtn,
      QToolbar,
      QToolbarTitle,
      QInput,
      QLayout,
      QDrawer,
      QHeader,
      QIcon,
      QPageContainer
    }
  });

  beforeEach(() => {
    const store = new Vuex.Store({
      getters: {
        isLoggedIn: () => true
      }
    });
    wrapper = mount(Layout, {
      propsData: {
        title: "Test title",
        search: true,
      },
      // Avoid error with translations.
      mocks: {
        $t: (key: string) => key
      },
      stubs: ["menu-drawer"],
      store,
      localVue,
      attachToDocument: true
    });
  });

  afterEach(() => wrapper.destroy())

  function findSearchButton(wrapper: Wrapper<Vue>) {
    return wrapper.findAll(QBtn).filter(button => button.text().includes("search"))
  };

  async function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  it("has search box", async () => {
    expect(wrapper.text()).toContain("Test title");
    expect(wrapper.find(QInput).exists()).toBe(false);
    const search = findSearchButton(wrapper);
    expect(search.exists()).toBe(true);
    search.trigger("click");
    await wrapper.vm.$nextTick();
    expect(findSearchButton(wrapper).exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Test title");
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    // Focus
    expect(input.element).toBe(document.activeElement);
    input.setValue("a");
    await wrapper.vm.$nextTick();
    // Debouncing
    expect(wrapper.emitted("search-input")).toBeUndefined();
    await timeout(300);
    expect(wrapper.emitted("search-input")).toBeTruthy();
    expect((wrapper.emitted("search-input") as Array<Array<string>>)[0]).toEqual(["a"]);
    // Search on enter.
    expect(wrapper.emitted("search")).toBeUndefined();
    input.trigger("keyup.enter");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("search")).toBeTruthy();
    expect((wrapper.emitted("search") as Array<Array<string>>)[0]).toEqual(["a"]);
    // Clear
    wrapper.findAll("i").filter(i => i.text().includes("clear")).trigger("click");
    await wrapper.vm.$nextTick();
    expect((wrapper.emitted("search-input") as Array<Array<string>>)[1]).toEqual([""]);

  });

});