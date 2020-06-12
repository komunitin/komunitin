import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import TransactionList from "../../../src/pages/transactions/TransactionList.vue";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";


describe("Transactions", () => {
  let wrapper: Wrapper<Vue>;
  // This is necessary to stop QInfiniteScroll continuously trigger load content.
  jest
    .spyOn(document.body, "scrollHeight", "get")
    .mockImplementation(() => 1500);

  beforeAll(async () => {
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.destroy());

  it("Loads and searches tansactions", async () => {
    // Wait for the login redirect.
    await wrapper.vm.$wait();
    // Click members link
    wrapper.get("#menu-transactions").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/JayceGloverDDS.Rolfson96/transactions");
    const transactions = wrapper.get(TransactionList).findAll(MemberHeader)
    // Further wait to load members.
    await wrapper.vm.$wait();
    expect(transactions.length).toBe(20);
    const first = transactions.wrappers[0];
    expect(first.text()).toContain("today");
    expect(first.text()).toContain("Hermina");
    expect(first.text()).toContain("35.67 $");
    expect(first.text()).toContain("Seamless");

    const fifth = transactions.wrappers[4];
    expect(fifth.text()).toContain("Pending");
    expect(fifth.text()).toContain("Hermina");
    expect(fifth.text()).toContain("-55.84 $");
    expect(fifth.text()).toContain("Configurable");
    // Search
    wrapper.get(PageHeader).vm.$emit("search", "configurable");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.get(TransactionList).findAll(MemberHeader).length).toBe(3);
  });
})