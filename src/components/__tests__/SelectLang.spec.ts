import { mount, Wrapper } from "@vue/test-utils";

// Install Komunitin global at Vue.prototype, since boot scripts are not run.
import "../../boot/komunitin";

// Set global i18n instance.
import {i18n} from "../../boot/i18n";

import Vue from 'vue';
import {
  Quasar,
  QSelect,
  QItem,
  QItemSection,
  QItemLabel,
  QBtnDropdown,
  QList
} from "quasar";

import SelectLang from "../SelectLang.vue";

/**
 * This test uses the global Vue variable in order to properly interact 
 * with boot functions and i18n plugin. It does not just tet the component 
 * but also the language logic.
 * **/
describe("SelectLang", () => {
  let wrapper: Wrapper<Vue>;

  // Using global Vue instance.
  Vue.use(Quasar, {
    components: {
      QSelect,
      QItem,
      QItemSection,
      QItemLabel,
      QBtnDropdown,
      QList
    }
  });

  beforeEach(() => {
    wrapper = mount(SelectLang, { i18n });
  });

  it("Check language change", async () => {
    expect(wrapper.text()).toContain("Language");
    // Don't know how to simulate the click on the menu item,
    // so invocking the method directly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).changeLanguage("ca");
    // Check language changed on i18n plugin.
    expect(i18n.locale).toBe("ca");
    // Check language changed on quasar.
    expect(wrapper.vm.$q.lang.isoName).toBe("ca");
  });
});
