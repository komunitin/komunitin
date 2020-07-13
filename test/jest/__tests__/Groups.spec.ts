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
    expect(text).toContain("Velit quis voluptatum harum");
    // URL
    expect(text).toContain("vance.info");
    // Offers card
    expect(text).toContain("Offers");
    expect(text).toContain("30");
    expect(text).toContain("6 Garden");
    // Needs card
    expect(text).toContain("Needs");
    expect(text).toContain("4");
    expect(text).toContain("1 Garden");
    // Members card
    expect(text).toContain("Members");
    expect(text).toContain("30");
    expect(text).toContain("Explore");
    // Currency card
    expect(text).toContain("Currency");
    expect(text).toContain("$");
    // Location
    expect(text).toContain("Avon");
    // Contact
    expect(text).toContain("558-336-5373");
    expect(text).toContain("Mittie.Green@hotmail.com");
    expect(text).toContain("@Noel82");
    expect(text).toContain("474-283-1596");
  })
});