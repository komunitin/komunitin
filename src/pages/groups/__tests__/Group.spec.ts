import { createLocalVue, shallowMount, Wrapper } from "@vue/test-utils";
import Group from "../Group.vue";

import {
  Quasar,
  QLayout,
  QPageContainer,
  QHeader,
  QBtn,
  QToolbar,
  QToolbarTitle,
  QInput,
  QDialog,
  QImg,
  QCard,
  QCardSection,
  QIcon,
  QSeparator,
  QInnerLoading,
  QList,
  QItem,
} from "quasar";

describe("Group.vue", () => {
  let code: string;
  let wrapper: Wrapper<Vue>;
  let errorsList: [Error, string];
  let notifyList: [{}];

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QLayout,
      QPageContainer,
      QHeader,
      QBtn,
      QToolbar,
      QToolbarTitle,
      QInput,
      QDialog,
      QImg,
      QCard,
      QCardSection,
      QIcon,
      QSeparator,
      QInnerLoading,
      QList,
      QItem
    }
  });

  beforeEach(() => {
    code = "GRP1";
    notifyList = [{}];
    errorsList = [new Error(), "Init"];

    require("../../../services/mirage.js");

    wrapper = shallowMount(Group, {
      propsData: {
        code
      },
      mocks: {
        // Avoid error with translations.
        $t: () => "Title Mock Text",
        $errorsManagement: {
          getErrors() {
            return {
              message: "MockErrorMessage"
            };
          },
          newError(e: Error, area: string) {
            // console.log({ area: area, e: e });
            errorsList.push(e, area);
          }
        },
        $q: {
          notify(options: {}) {
            // console.log({ NotifyOptions: options });
            notifyList.push(options);
          }
        }
      },
      localVue
    });
  });

  it("check receive data", async () => {
    expect(wrapper.vm.$data.isLoading).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).fetchGroup();
    expect(wrapper.vm.$data.isLoading).toBe(false);
    expect(wrapper.vm.$data.group).toBeTruthy();
  });
});
