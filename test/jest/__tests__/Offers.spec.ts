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
    wrapper = await mountComponent(App);
    await wrapper.vm.$router.push("/groups/GRP0/offers");
  });
  afterAll(() => wrapper.destroy());

  it("Loads offers", async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    expect(wrapper.find(QInfiniteScroll).props("disable")).toBe(true);
    // Initial load.
    await wrapper.vm.$wait();
    expect(wrapper.findAll(OfferCard).length).toBe(ApiSerializer.DEFAULT_PAGE_SIZE);
    expect(wrapper.find(QInfiniteScroll).props("disable")).toBe(false);
    // Instead of trying to simulate the scroll event, which is very coupled
    // with the tech layer, just call the trigger() function in QInfiniteScroll.
    (wrapper.find(QInfiniteScroll).vm as QInfiniteScroll).trigger();
    await wrapper.vm.$wait();
    expect(wrapper.findAll(OfferCard).length).toBe(30);
    // The QInfiniteScroll stopped.
    expect((wrapper.find(QInfiniteScroll).vm as any).working).toBe(false);
  });

  it ("searches offers", async () => {
    // The user interaction is already tested in PageHeader unit test,
    // here just emit the search event.
    wrapper.get(PageHeader).vm.$emit("search","bacon");
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(OfferCard).length).toBe(0);
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    // found 3 results!
    expect(wrapper.findAll(OfferCard).length).toBe(3);
  })

});