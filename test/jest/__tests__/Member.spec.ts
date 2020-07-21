import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import { QTab, QInnerLoading } from "quasar";
import NeedCard from "../../../src/components/NeedCard.vue";
import OfferCard from "../../../src/components/OfferCard.vue";
import MemberList from "../../../src/pages/members/MemberList.vue";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import TransactionItems from "../../../src/pages/transactions/TransactionItems.vue";

describe("Member", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.destroy());

  it("Navigation to my account", async () => {
    // Wait for the login redirect.
    await wrapper.vm.$wait();
    // Click members link
    await wrapper.get("#my-member").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/TomasaNikolausV_Ledner62");
    // Wait for content.
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("GRP0000");
    expect(text).toContain("Public account");
    expect(text).toContain("515.04 $");
    expect(text).toContain("Min -500 $");
    // Tabs
    expect(text).toContain("Profile");
    expect(text).toContain("1 Need");
    expect(text).toContain("3 Offers");
    expect(wrapper.findAll(QTab).length).toBe(3);
    // Bio
    expect(text).toContain("Consequuntur aut est fuga");
    // Contact
    expect(text).toContain("133-639-5843");
    expect(text).toContain("@Precious_Rau31");
    // Location
    expect(text).toContain("Avon");
    
    // Needs

    const needsTab = wrapper.findAll(QTab).at(1);
    needsTab.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.get(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.findAll(NeedCard).length).toBe(1);
    
    // Offers
    const offersTab = wrapper.findAll(QTab).at(2);
    offersTab.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.get(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.findAll(OfferCard).length).toBe(3);
  });

  it("Navigation from Members List", async () => {
    await wrapper.vm.$wait();
    wrapper.get("#menu-members").trigger("click");
    await wrapper.vm.$nextTicks();
    await wrapper.vm.$wait();
    const member = wrapper.get(MemberList).findAll(MemberHeader).at(1);
    member.trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/TheaKlocko87");
    const text = wrapper.text();
    expect(text).toContain("Thea");
    expect(text).toContain("GRP00001");
    expect(text).toContain("261.39 $");
    expect(text).toContain("Magnam ullam at");
    expect(text).toContain("Ozella_Gerhold49@hotmail.com");
    expect(text).toContain("No Needs");
    expect(text).toContain("3 Offers");

    const tabs = wrapper.findAll(QTab);
    expect(tabs.length).toBe(4);

    //Offers
    tabs.at(2).trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.get(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    const offers = wrapper.findAll(OfferCard);
    expect(offers.length).toBe(3);
    const offer = offers.at(0);
    expect(offer.text()).toContain("Thea");

    // Transactions
    tabs.at(3).trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.get(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    const transactions = wrapper.get(TransactionItems).findAll(MemberHeader);
    expect(transactions.length).toBe(5);
  });

})