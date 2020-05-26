/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll } from "quasar";
import OfferCard from "../../../src/components/OfferCard.vue";
import ApiSerializer from "src/server/ApiSerializer";

describe("Front page and login", () => {
  let wrapper: Wrapper<Vue>;
  beforeAll(async () => {
    wrapper = await mountComponent(App);
  });
  afterAll(() => wrapper.destroy());

  it("Loads offers", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/offers");
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
    // The QInfiniteScroll is stopped since we fetched all data.
    expect((wrapper.find(QInfiniteScroll).vm as any).working).toBe(false);
  });
});