/**
 * @jest-environment jsdom
 */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";

describe("Explore groups", () => {
  let wrapper: Wrapper<Vue>;
  beforeAll(async() => {
    wrapper = await mountComponent(App);
  });

  afterAll(() => wrapper.destroy());

  it("goes to explore group and back to front page", async () => {
    wrapper.get("#explore").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups");
    const list = wrapper.text();
    expect(list).toContain("GRP1");
    expect(list).toContain("GRP10");
    wrapper.get("[href='/groups/GRP1']").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups/GRP1");
    const group = wrapper.text();
    expect(group).toContain("GRP1");
    expect(group).toContain("easterislandgroup.org");
    // Go back home
    wrapper.get("#back").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups");
    wrapper.get("#back").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/");
  });
});