/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll } from "quasar";
import OfferCard from "../../../src/components/OfferCard.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";
import ApiSerializer from "src/server/ApiSerializer";

describe("Offers", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.destroy());

  it("Loads offers", async () => {
    // Wait for login redirect
    await wrapper.vm.$wait();
    await wrapper.vm.$router.push("/groups/GRP0/offers");
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QInnerLoading).isVisible()).toBe(true);
    expect(wrapper.findComponent(QInfiniteScroll).props("disable")).toBe(true);
    // Initial load.
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(ApiSerializer.DEFAULT_PAGE_SIZE);
    expect(wrapper.findComponent(QInfiniteScroll).props("disable")).toBe(false);
    // Instead of trying to simulate the scroll event, which is very coupled
    // with the tech layer, just call the trigger() function in QInfiniteScroll.
    (wrapper.findComponent(QInfiniteScroll).vm as QInfiniteScroll).trigger();
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(30);
    // The QInfiniteScroll stopped.
    expect((wrapper.findComponent(QInfiniteScroll).vm as any).working).toBe(false);
    // Category icon
    expect(wrapper.findAllComponents(OfferCard).at(0).text()).toContain("accessibility_new");
  });

  it ("searches offers", async () => {
    // The user interaction is already tested in PageHeader unit test,
    // here just emit the search event.
    wrapper.getComponent(PageHeader).vm.$emit("search","soap");
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(0);
    expect(wrapper.findComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    // found 10 results!
    expect(wrapper.findAllComponents(OfferCard).length).toBe(3);
  })

  it ("renders single offer", async() => {
    await wrapper.vm.$router.push("/groups/GRP0/offers/Soap4");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Soap");
    expect(text).toContain("Magali");
    expect(text).toContain("GRP00001");
    expect(text).toContain("7.60 $");
    expect(text).toContain("Updated yesterday");
  })

});