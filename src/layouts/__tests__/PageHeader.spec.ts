import Vue from "vue";
import { createLocalVue, mount, Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";

import {
  Quasar,
  QBtn,
  QToolbar,
  QToolbarTitle,
  QInput,
  QHeader,
  QIcon,
  QLayout,
  QScrollObserver
} from "quasar";
import PageHeader from "../PageHeader.vue";

describe("PageHeader", () => {
  let wrapper: Wrapper<Vue>;
  let store: Store<{ ui: { [key: string]: boolean } }>;
  let toogleDrawer: () => void;

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
      QHeader,
      QIcon,
      QLayout,
      QScrollObserver
    }
  });

  beforeEach(() => {
    toogleDrawer = jest.fn();
    store = new Vuex.Store({
      state: () => ({
        ui: {
          drawerPersistent: true,
          drawerState: true,
          drawerExists: true
        },
        stub: {
          myAccount: undefined,
        }
      }),
      getters: {
        drawerExists: state => state.ui.drawerExists,
        myAccount: state => state.stub.myAccount,
      },
      mutations: {
        drawerPersistent: (state, v) => (state.ui.drawerPersistent = v),
        drawerState: (state, v) => (state.ui.drawerState = v),
        drawerExists: (state, v) => (state.ui.drawerExists = v),
        myAccount: (state, v) => (state.stub.myAccount = v),
      },
      actions: { toogleDrawer }
    });
    const layout = mount(QLayout, {
      propsData: {
        view: "LHH LpR LfR"
      },
      localVue
    });

    wrapper = mount(PageHeader, {
      provide: {
        layout: layout.vm
      },
      propsData: {
        title: "Test title",
        search: true,
        balance: true
      },
      // Avoid error with translations.
      mocks: {
        $t: (key: string) => key,
        $n: (n: number) => n + '',
      },
      store,
      localVue,
      attachTo: document.body
    });
  });

  afterEach(() => wrapper.destroy());

  function findSearchButton(wrapper: Wrapper<Vue>) {
    return wrapper
      .findAllComponents(QBtn)
      .filter(button => button.text().includes("search"));
  }

  async function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  it("has back icon", async () => {
    store.commit("drawerExists", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#menu").exists()).toBe(false);
    expect(wrapper.find("#back").exists()).toBe(true);
  });

  it("has menu icon", async () => {
    store.commit("drawerExists", true);
    store.commit("drawerPersistent", false);
    store.commit("drawerState", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#back").exists()).toBe(false);
    const menu = wrapper.find("#menu");
    expect(menu.exists()).toBe(true);
    menu.trigger("click");
    await wrapper.vm.$nextTick();
    expect(toogleDrawer).toBeCalled();
  });

  it("doesn't have icon", async () => {
    store.commit("drawerExists", true);
    store.commit("drawerPersistent", true);
    store.commit("drawerState", true);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#back").exists()).toBe(false);
    expect(wrapper.find("#menu").exists()).toBe(false);
  });

  it("has search box", async () => {
    expect(wrapper.text()).toContain("Test title");
    expect(wrapper.findComponent(QInput).exists()).toBe(false);
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
    expect(
      (wrapper.emitted("search-input") as Array<Array<string>>)[0]
    ).toEqual(["a"]);
    // Search on enter.
    expect(wrapper.emitted("search")).toBeUndefined();
    input.trigger("keyup.enter");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("search")).toBeTruthy();
    expect((wrapper.emitted("search") as Array<Array<string>>)[0]).toEqual([
      "a"
    ]);
    // Clear
    wrapper
      .findAll("i")
      .filter(i => i.text().includes("clear"))
      .trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      (wrapper.emitted("search-input") as Array<Array<string>>)[1]
    ).toEqual([""]);
  });
  it("shows the balance", async () => {
    const account = {
      attributes: {
        balance: 100
      },
      currency: {
        attributes: {
          scale: 2,
          decimals: 2,
          symbol: "$"
        },
      }
    }
    store.commit("myAccount", account);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("balance");
    expect(wrapper.text()).toContain("1 $");
    const header = wrapper.getComponent(QHeader).element;
    expect(header.style.height).toBe("170px");
    const scroll = wrapper.getComponent(QScrollObserver);
    scroll.vm.$emit("scroll", {position: 10});
    await wrapper.vm.$nextTick();
    expect(header.style.height).toBe("160px");
    expect(wrapper.text()).toContain("$");
    scroll.vm.$emit("scroll", {position: 101});
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain("$");
    expect(header.style.height).toBe("69px");
    scroll.vm.$emit("scroll", {position: 200});
    await wrapper.vm.$nextTick();
    expect(header.style.height).toBe("64px");
    
  });
});
