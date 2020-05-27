/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading } from "quasar";
import GroupCard from "../../../src/components/GroupCard.vue";

// See also Offers.spec.ts
describe("Groups", () => {
  let wrapper: Wrapper<Vue>;
  // This is necessary to stop QInfiniteScroll continuously trigger load content.
  jest.spyOn(document.body, "scrollHeight", "get").mockImplementation(() => 1500);


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
});