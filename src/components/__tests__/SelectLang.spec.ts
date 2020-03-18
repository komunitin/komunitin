import { createLocalVue, mount, Wrapper } from "@vue/test-utils";
import SelectLang from "../SelectLang.vue";
import {
  Quasar,
  QSelect,
  QItem,
  QItemSection,
  QItemLabel,
  QBtnDropdown,
  QList
} from "quasar";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Koptions = require("src/komunitin.json");

describe("SelectLang", () => {
  let locale: string;
  // let langs: {};
  // @ts-ignore
  let wrapper: Wrapper<SelectLang>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QSelect,
      QItem,
      QItemSection,
      QItemLabel,
      QBtnDropdown,
      QList
    }
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    locale = "en-us";
    // langs = Koptions.langs;
    wrapper = mount(SelectLang, {
      // Avoid error with translations.
      mocks: {
        $t: () => "Title Mock Text",
        $i18n: {
          locale: locale
        },
        $Koptions: Koptions
      },
      localVue
    });
  });

  it("Check that it emits the selected language", () => {
    const newLang = wrapper.vm.$data.langs[0].value;
    wrapper.vm.$emit("setLocale");
    wrapper.vm.$emit("setLocale", newLang);
    expect(wrapper.emitted().setLocale).toBeTruthy();
  });

  it('Check that it emits the "ca" language', () => {
    wrapper.vm.$emit("setLocale", "ca");
    expect(wrapper.emitted().setLocale?.length).toBe(1);
  });
});
