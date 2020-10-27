import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import TransactionList from "../../../src/pages/transactions/TransactionList.vue";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";

describe("Transactions", () => {
  let wrapper: Wrapper<Vue>;
  
  beforeAll(async () => {  
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => {
    wrapper.destroy();
  });

  
  it("Loads and searches tansactions", async () => {
    // Wait for the login redirect.
    await wrapper.vm.$wait();

    // Click members link
    wrapper.get("#menu-transactions").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/TomasaNikolausV_Ledner62/transactions");
    // Further wait to load members.
    await wrapper.vm.$wait();
    const transactions = wrapper.get(TransactionList).findAll(MemberHeader)
    expect(transactions.length).toBe(20);
    const first = transactions.wrappers[0];
    expect(first.text()).toContain("today");
    expect(first.text()).toContain("Alessandra");
    expect(first.text()).toContain("86.06 $");
    expect(first.text()).toContain("Front");

    const fifth = transactions.wrappers[6];
    expect(fifth.text()).toContain("Pending");
    expect(fifth.text()).toContain("Thea");
    expect(fifth.text()).toContain("-61.51 $");
    expect(fifth.text()).toContain("Integrated");
    // Search
    wrapper.get(PageHeader).vm.$emit("search", "inter");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.get(TransactionList).findAll(MemberHeader).length).toBe(4);
  });
  it("renders single transaction", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/transactions/10046e7b-7d33-4e99-b765-085f39848594");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Isobel");
    expect(text).toContain("GRP00005");
    expect(text).toContain("Tomasa");
    expect(text).toContain("GRP00000");
    expect(text).toContain("-47.53 $");
    expect(text).toContain("yesterday at");
    expect(text).toContain("Robust");
    expect(text).toContain("Committed");
    expect(text).toContain("Group 0");
  })
})