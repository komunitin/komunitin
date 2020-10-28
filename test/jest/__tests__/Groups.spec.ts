/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading } from "quasar";
import GroupCard from "../../../src/components/GroupCard.vue";

// See also Offers.spec.ts
describe("Groups", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(App);
  });
  afterAll(() => wrapper.destroy());

  it("Loads groups", async () => {
    await wrapper.vm.$router.push("/groups");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    // Load.
    await wrapper.vm.$wait();
    expect(wrapper.findAll(GroupCard).length).toBe(7);
    expect((wrapper.find(QInnerLoading).vm as QInnerLoading).showing).toBe(false);
  });

  it ("Render group page", async () => {
    await wrapper.vm.$router.push("/groups/GRP0");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    const text = wrapper.text();
    // Title
    expect(text).toContain("Group 0");
    // Code
    expect(text).toContain("GRP0");
    // Description
    expect(text).toContain("Et facere placeat molestiae");
    // URL
    expect(text).toContain("rae.name");
    // Offers card
    expect(text).toContain("Offers");
    expect(text).toContain("30");
    expect(text).toContain("6 Health");
    // Needs card
    expect(text).toContain("Needs");
    expect(text).toContain("4");
    expect(text).toContain("1 Health");
    // Members card
    expect(text).toContain("Members");
    expect(text).toContain("30");
    expect(text).toContain("Explore");
    // Currency card
    expect(text).toContain("Currency");
    expect(text).toContain("$");
    // Location
    expect(text).toContain("Buckinghamshire");
    // Contact
    expect(text).toContain("133-639-5843");
    expect(text).toContain("Larue_Johnston41@gmail.com");
    expect(text).toContain("@Teresa.Effertz29");
    expect(text).toContain("693-357-6718");
  })
});