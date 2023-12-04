/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueWrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll } from "quasar";
import OfferCard from "../../../src/components/OfferCard.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";
import ApiSerializer from "src/server/ApiSerializer";
import { seeds } from "src/server";

describe("Offers", () => {
  let wrapper: VueWrapper;

  beforeAll(async () => {
    seeds();
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.unmount());

  it("Loads offers", async () => {
    // Wait for login redirect
    await wrapper.vm.$wait();
    await wrapper.vm.$router.push("/groups/GRP0/offers");
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QInnerLoading).isVisible()).toBe(true);
    // Initial load.
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(ApiSerializer.DEFAULT_PAGE_SIZE);
    // Instead of trying to simulate the scroll event, which is very coupled
    // with the tech layer, just call the trigger() function in QInfiniteScroll.
    (wrapper.findComponent(QInfiniteScroll).vm as QInfiniteScroll).trigger();
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(30);
    // Category icon
    expect(wrapper.findAllComponents(OfferCard)[0].text()).toContain("accessibility_new");
  });

  it ("searches offers", async () => {
    // The user interaction is already tested in PageHeader unit test,
    // here just emit the search event.
    wrapper.getComponent(PageHeader).vm.$emit("search","pants");
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(0);
    expect(wrapper.findComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    // found 10 results!
    expect(wrapper.findAllComponents(OfferCard).length).toBe(3);
  })

  it ("renders single offer", async() => {
    await wrapper.vm.$router.push("/groups/GRP0/offers/Tuna5");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Tuna");
    expect(text).toContain("Magali");
    expect(text).toContain("GRP00001");
    expect(text).toContain("$0.88");
    expect(text).toContain("Updated yesterday");
  })

});