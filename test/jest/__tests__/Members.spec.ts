/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll } from "quasar";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";
import MemberList from "../../../src/pages/members/MemberList.vue";

// See also Offers.spec.ts
describe("Members", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.destroy());

  it("Loads members, balances and searches", async () => {
    // Wait for the login redirect.
    await wrapper.vm.$wait();
    // Click members link
    await wrapper.get("#menu-members").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members");
    expect(wrapper.get(QInnerLoading).isVisible()).toBe(true);
    // Wait for content loading.
    await wrapper.vm.$wait();
    expect(wrapper.get(MemberList).findAll(MemberHeader).length).toBe(20);
    (wrapper.get(QInfiniteScroll).vm as QInfiniteScroll).trigger();
    await wrapper.vm.$wait();
    expect(wrapper.get(MemberList).findAll(MemberHeader).length).toBe(30);
    await wrapper.vm.$nextTick();
    // Infinite scroll stopped since we fetchyed all available data.
    expect((wrapper.find(QInfiniteScroll).vm as any).working).toBe(false);
    // Check GRP00002 result
    const members = wrapper.get(MemberList).findAll(MemberHeader);
    const second = members.wrappers[2];
    expect(second.text()).toContain("Cameron");
    expect(second.text()).toContain("GRP00002");
    expect(second.text()).toContain("583.11 $");
    expect(second.text()).toContain("Min -500 $");
    // Check GRP00025 result
    const other = members.wrappers[25];
    expect(other.text()).toContain("Roberto");
    expect(other.text()).toContain("GRP00025");
    expect(other.text()).toContain("386.64 $");
    expect(other.text()).toContain("Min -500 $");
    // Search
    wrapper.get(PageHeader).vm.$emit("search", "isobe");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.get(MemberList).findAll(MemberHeader).length).toBe(1);
    const result = wrapper.get(MemberList).get(MemberHeader);
    expect(result.text()).toContain("Isobel Upton");
    expect(result.text()).toContain("GRP00005");
    expect(result.text()).toContain("598.71 $");
  });
});
