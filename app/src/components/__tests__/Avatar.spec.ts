import { mount } from "@vue/test-utils";
import Avatar from "../Avatar.vue";
import {QAvatar, Quasar} from "quasar";

describe("SimpleMap", () => {  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quasarPlugin: [typeof Quasar, any] = [Quasar, {
    components: { QAvatar }
  }]

  it("Renders image", async () => {
    const wrapper = mount(Avatar, {
      props: {
        imgSrc: "https://path_to_image.com",
        text: "anything"
      },
      global: {
        plugins: [quasarPlugin]
      }
    });
    expect(wrapper.html()).toContain("<img src=\"https://path_to_image.com\"");
  });

  it("Renders initial", async () => {
    const wrapper = mount(Avatar, {
      propsData: {
        text: "anything"
      },
      global: {
        plugins: [quasarPlugin]
      }
    });
    expect(wrapper.html()).not.toContain("<img");
    expect(wrapper.text()).toEqual("A");
    expect(wrapper.html()).toContain("background-color: rgb(204, 41, 90);");
  });

});