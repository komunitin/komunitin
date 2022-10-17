import { flushPromises, VueWrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QTab, QInnerLoading } from "quasar";
import NeedCard from "../../../src/components/NeedCard.vue";
import OfferCard from "../../../src/components/OfferCard.vue";
import MemberList from "../../../src/pages/members/MemberList.vue";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import TransactionItems from "../../../src/pages/transactions/TransactionItems.vue";
import { seeds } from "src/server";

describe("Member", () => {
  let wrapper: VueWrapper;

  beforeAll(async () => {
    seeds();
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.unmount());

  it("Navigation to my account", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/needs")
    // Wait for the login redirect.
    await flushPromises();
    // Click members link
    await wrapper.get("#my-member").trigger("click");
    await flushPromises();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/TomasaNikolausV_Ledner62");
    // Wait for content.
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("GRP0000");
    expect(text).toContain("Public account");
    expect(text).toContain("655.92 $");
    expect(text).toContain("Min -500 $");
    // Tabs
    expect(text).toContain("Profile");
    expect(text).toContain("1 Need");
    expect(text).toContain("3 Offers");
    expect(wrapper.findAllComponents(QTab).length).toBe(3);
    // Bio
    expect(text).toContain("Consequuntur aut est fuga");
    // Contact
    expect(text).toContain("363-958-4365");
    expect(text).toContain("@Sharon.Turner");
    // Location
    expect(text).toContain("Avon");
    
    // Needs

    const needsTab = wrapper.findAllComponents(QTab)[1];
    needsTab.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(NeedCard).length).toBe(1);
    
    // Offers
    const offersTab = wrapper.findAllComponents(QTab)[2];
    await offersTab.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.findAllComponents(OfferCard).length).toBe(3);
  });

  it("Navigation from Members List", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/needs")
    // Wait for the login redirect.
    await flushPromises();
    wrapper.get("#menu-members").trigger("click");
    await wrapper.vm.$nextTicks();
    await wrapper.vm.$wait();
    const member = wrapper.getComponent(MemberList).findAllComponents(MemberHeader)[1];
    member.trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/MagaliLeffler45");
    const text = wrapper.text();
    expect(text).toContain("Magali");
    expect(text).toContain("GRP00001");
    expect(text).toContain("-199.78 $");
    expect(text).toContain("Nisi");
    expect(text).toContain("@yahoo.com");
    expect(text).toContain("No Needs");
    expect(text).toContain("3 Offers");

    const tabs = wrapper.findAllComponents(QTab);
    expect(tabs.length).toBe(4);

    // Needs (empty)
    tabs[1].trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("nothing here");

    //Offers
    tabs[2].trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    const offers = wrapper.findAllComponents(OfferCard);
    expect(offers.length).toBe(3);
    const offer = offers[0];
    expect(offer.text()).toContain("Magali");

    // Transactions
    tabs[3].trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.getComponent(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    const transactions = wrapper.getComponent(TransactionItems).findAllComponents(MemberHeader);
    expect(transactions.length).toBe(5);
  });

})