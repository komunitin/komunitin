import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import SocialNetworkList from '../SocialNetworkList.vue';
import {
  Quasar,
  QCard,
  QItem,
  QAvatar,
  QIcon,
  QItemSection,
  QItemLabel,
  QList
} from "quasar";

describe("SocialNetworkList", () => {
  let contacts : {[key: string]: { name: string }};

  let contact: Wrapper<Vue>;
  let share: Wrapper<Vue>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QCard, QItem, QAvatar, QIcon, QItemSection, QItemLabel, QList}
  });

  async function checkClick(wrapper: Wrapper<Vue>, ref: string, url: string) {
    // Mock window.open function.
    delete window.open;
    window.open = jest.fn();
    // Click
    wrapper.find({ref: ref}).trigger("click");
    // Wait for event to be handled.
    await wrapper.vm.$nextTick();
    expect(window.open).toHaveBeenCalledWith(url, "_blank");
  }

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    contacts = {
      "phone": {
        name: "+34 666 77 88 99"
      },
      "email": {
        name: "exhange@easterisland.com"
      },
      "whatsapp": {
        name: "+34 666 66 66 66"
      },
      "telegram": {
        name: "@example"
      },
      "unkonwn": {
        name: "unknown"
      }
    }

    contact = mount(SocialNetworkList, {
      propsData: {
        networks: contacts,
        type: "contact"
      },
      localVue
    });

    share = mount(SocialNetworkList, {
      propsData: {
        type: "share",
        title: "Title",
        text: "Text",
        url: "https://example.com"
      },
      localVue
    });
  });

  it("Contact html generated", async () => {
    // Test rendering.
    expect(contact.text()).toContain("+34 666 77 88 99");
  });

  it("Contact click", async () => {
    return checkClick(contact, "phone", "tel:"+encodeURIComponent("+34 666 77 88 99"));
  });

  it ("Share html generated", async () => {
    expect(share.text()).toContain("Twitter");
  });

  it("Share click", async () => {
    return checkClick(share, "twitter", "https://twitter.com/intent/tweet?url=" + encodeURIComponent("https://example.com") +"&text=Title");
  });
});
