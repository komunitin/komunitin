/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueWrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QInnerLoading, QInfiniteScroll, QAvatar } from "quasar";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";
import MemberList from "../../../src/pages/members/MemberList.vue";
import { seeds } from "src/server";

// See also Offers.spec.ts
describe("Members", () => {
  let wrapper: VueWrapper;

  beforeAll(async () => {
    seeds();
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.unmount());

  it("Loads members, balances and searches", async () => {
    // Wait for login redirect
    await wrapper.vm.$wait();
    // Click members link
    await wrapper.get("#menu-members").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members");
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    // Wait for content loading.
    await wrapper.vm.$wait();
    expect(wrapper.getComponent(MemberList).findAllComponents(MemberHeader).length).toBe(20);
    (wrapper.getComponent(QInfiniteScroll).vm as QInfiniteScroll).trigger();
    await wrapper.vm.$wait();
    expect(wrapper.getComponent(MemberList).findAllComponents(MemberHeader).length).toBe(30);
    await wrapper.vm.$nextTick();
    // Infinite scroll stopped since we fetched all available data.
    const scroll = wrapper.findComponent(QInfiniteScroll).vm as any;
    expect(scroll.isWorking).toBe(false)
    // Check GRP00002 result
    const members = wrapper.getComponent(MemberList).findAllComponents(MemberHeader);
    const second = members[2];
    expect(second.text()).toContain("Cameron");
    expect(second.text()).toContain("GRP00002");
    expect(second.text()).toContain("583.11 $");
    expect(second.text()).toContain("Min -500 $");
    // Avatar image
    expect(second.html()).toContain("<img");

    // Default avatar
    const avatar = members[0].findComponent(QAvatar); 
    expect(avatar.text()).toEqual("T");

    // Check GRP00025 result
    const other = members[25];
    expect(other.text()).toContain("Roberto");
    expect(other.text()).toContain("GRP00025");
    expect(other.text()).toContain("386.64 $");
    expect(other.text()).toContain("Min -500 $");
    // Search
    wrapper.getComponent(PageHeader).vm.$emit("search", "isobe");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.getComponent(MemberList).findAllComponents(MemberHeader).length).toBe(1);
    const result = wrapper.getComponent(MemberList).getComponent(MemberHeader);
    expect(result.text()).toContain("Isobel Upton");
    expect(result.text()).toContain("GRP00005");
    expect(result.text()).toContain("598.71 $");
  });
});
