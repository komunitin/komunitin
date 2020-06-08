/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll } from "quasar";
import NeedCard from "../../../src/components/NeedCard.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";

// See also Offers.spec.ts
describe("Needs", () => {
  let wrapper: Wrapper<Vue>;
  // This is necessary to stop QInfiniteScroll continuously trigger load content.
  jest.spyOn(document.body, "scrollHeight", "get").mockImplementation(() => 1500);


  beforeAll(async () => {
    wrapper = await mountComponent(App);
  });
  afterAll(() => wrapper.destroy());

  it("Loads needs and searches", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/needs");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    expect(wrapper.find(QInfiniteScroll).props("disable")).toBe(true);
    // Load.
    await wrapper.vm.$wait();
    expect(wrapper.findAll(NeedCard).length).toBe(15);
    // Infinite loading doesn't get enabled since we already fetched all data.
    expect(wrapper.find(QInfiniteScroll).props("disable")).toBe(true);
    wrapper.get(PageHeader).vm.$emit("search","repellendus");
    await wrapper.vm.$wait();
    // found 4 results!
    expect(wrapper.findAll(NeedCard).length).toBe(4);
  });
});