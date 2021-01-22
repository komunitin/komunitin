import { createLocalVue, shallowMount } from "@vue/test-utils";
import Avatar from "../Avatar.vue";
import {QAvatar, Quasar} from "quasar";

describe("SimpleMap", () => {
  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();
  localVue.use(Quasar, {components: {QAvatar}})

  it("Renders image", async () => {
    const wrapper = shallowMount(Avatar, {
      propsData: {
        imgSrc: "https://path_to_image.com",
        text: "anything"
      },
      localVue
    });
    expect(wrapper.html()).toContain("<img src=\"https://path_to_image.com\"");
  });

  it("Renders initial", async () => {
    const wrapper = shallowMount(Avatar, {
      propsData: {
        text: "anything"
      },
      localVue
    });
    expect(wrapper.html()).not.toContain("<img");
    expect(wrapper.text()).toEqual("A");
    expect(wrapper.html()).toContain("background-color: rgb(204, 41, 90);");
  });

});