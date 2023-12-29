import { flushPromises, VueWrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import TransactionList from "../../../src/pages/transactions/TransactionList.vue";
import MemberHeader from "../../../src/components/MemberHeader.vue";
import SelectMember from "../../../src/components/SelectMember.vue";
import PageHeader from "../../../src/layouts/PageHeader.vue";
import { seeds } from "src/server";
import { QDialog, QList } from "quasar";

describe("Transactions", () => {
  let wrapper: VueWrapper;
  
  beforeAll(async () => {  
    seeds();
    wrapper = await mountComponent(App, { login: true });
    
  });
  afterAll(() => {
    wrapper.unmount();
  });

  
  it("Loads and searches tansactions", async () => {
    await wrapper.vm.$router.push("/login");
    // Wait for login redirect
    await flushPromises();
    // Click transactions link
    await wrapper.get("#menu-transactions").trigger("click");
    await flushPromises();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/TomasaNikolausV_Ledner62/transactions");
    // Further wait to load members.
    await flushPromises();
    await wrapper.vm.$wait();
    const transactions = wrapper.getComponent(TransactionList).findAllComponents(MemberHeader)
    expect(transactions.length).toBe(20);
    const first = transactions[0];
    expect(first.text()).toContain("Pending");
    expect(first.text()).toContain("Magali");
    expect(first.text()).toContain("$-8.00");
    expect(first.text()).toContain("Persevering");

    const second = transactions[1];
    expect(second.text()).toContain("today");
    expect(second.text()).toContain("Isobel");
    expect(second.text()).toContain("$70.72");
    expect(second.text()).toContain("Inverse");
    // Search
    wrapper.getComponent(PageHeader).vm.$emit("search", "desk");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.getComponent(TransactionList).findAllComponents(MemberHeader).length).toBe(2);
  });
  it("renders single transaction", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/transactions/8e8bf9df-3f8c-4682-9660-515da55fc265");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Tomasa");
    expect(text).toContain("GRP00000");
    expect(text).toContain("Isobel");
    expect(text).toContain("GRP00005");
    expect(text).toContain("$70.72");
    expect(text).toContain("today at");
    expect(text).toContain("Inverse");
    expect(text).toContain("Committed");
    expect(text).toContain("Group 0");
  })
  it("creates new transaction", async () =>  {
    await wrapper.vm.$router.push("/login");
    await flushPromises();
    // Click transactions link
    await wrapper.get("#menu-transactions").trigger("click");
    await flushPromises();
    await wrapper.get("#create-transaction").trigger("click");
    await flushPromises();
    await wrapper.getComponent(SelectMember).get('div').trigger("click");
    await flushPromises()
    await wrapper.vm.$wait()
    const list = wrapper.getComponent(QDialog).getComponent(QList)
    expect(list.text()).toContain("Cameron")
    const payer = list.findAllComponents(MemberHeader)[2]
    await payer.trigger("click")
    await flushPromises();
    await wrapper.get("[name='description']").setValue("Test transaction description.")
    await wrapper.get("[name='amount']").setValue("123")
    await wrapper.get("button[type='submit']").trigger("click")
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain("Cameron");
    expect(text).toContain("Tomasa");
    expect(text).toContain("123");
    expect(text).toContain("Test transaction description.");
    expect(text).toContain("today")
    await wrapper.get("button[type='submit']").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")

  })
})