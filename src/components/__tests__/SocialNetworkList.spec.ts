import { mount, VueWrapper } from "@vue/test-utils";
import SocialNetworkList from "../SocialNetworkList.vue";
import { Quasar } from "quasar";
import { Contact } from "src/store/model";
import { config } from '@vue/test-utils';

// Install quasar by default.
config.global.plugins.unshift([Quasar, {}]);

describe("SocialNetworkList", () => {
  let contacts: Partial<Contact>[];

  let contact: VueWrapper;
  let share: VueWrapper;

  async function checkClick(wrapper: VueWrapper, ref: string, url: string) {
    // Mock window.open function.
    // delete window.open;
    window.open = jest.fn();
    // Click
    wrapper.findComponent({ ref: ref }).trigger("click");
    // Wait for event to be handled.
    await wrapper.vm.$nextTick();
    expect(window.open).toHaveBeenCalledWith(url, "_blank");
  }

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    contacts = [
      { type: "phone", name: "+34 666 77 88 99" },
      { type: "email", name: "exhange@easterisland.com" },
      { type: "whatsapp", name: "+34 666 66 66 66" },
      { type: "telegram", name: "@example" },
      { type: "unkonwn", name: "unknown" }
    ].map(obj => ({
      attributes: {
        ...obj,
        created: new Date().toJSON(),
        updated: new Date().toJSON()
      }
    }));

    contact = mount(SocialNetworkList, {
      props: {
        contacts,
        type: "contact"
      },
    });

    share = mount(SocialNetworkList, {
      props: {
        type: "share",
        title: "Title",
        text: "Text",
        url: "https://example.com"
      },
    });
  });

  it("Contact html generated", async () => {
    // Test rendering.
    expect(contact.text()).toContain("+34 666 77 88 99");
  });

  it("Contact click", async () => {
    return checkClick(
      contact,
      "phone",
      "tel:" + encodeURIComponent("+34 666 77 88 99")
    );
  });

  it("Share html generated", async () => {
    expect(share.text()).toContain("Twitter");
  });

  it("Share click", async () => {
    return checkClick(
      share,
      "twitter",
      "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent("https://example.com") +
        "&text=Title"
    );
  });
});
