import { mount } from "@vue/test-utils";
import Avatar from "../Avatar.vue";
import {Quasar} from "quasar";

describe("SimpleMap", () => {  
  it("Renders image", async () => {
    const wrapper = mount(Avatar, {
      props: {
        imgSrc: "https://path_to_image.com",
        text: "anything"
      },
      global: {
        plugins: [[Quasar, {}]]
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
        plugins: [[Quasar, {}]]
      }
    });
    expect(wrapper.html()).not.toContain("<img");
    expect(wrapper.text()).toEqual("A");
    expect(wrapper.html()).toContain("background-color: rgb(204, 41, 90);");
  });

});