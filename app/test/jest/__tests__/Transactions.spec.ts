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
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/EmilianoLemke57/transactions");
    // Further wait to load members.
    await flushPromises();
    await wrapper.vm.$wait();
    const transactions = wrapper.getComponent(TransactionList).findAllComponents(MemberHeader)
    expect(transactions.length).toBe(20);
    const first = transactions[4];
    expect(first.text()).toContain("Pending");
    expect(first.text()).toContain("Arnoldo");
    expect(first.text()).toContain("$-0.42");
    expect(first.text()).toContain("Synchronised");

    const second = transactions[1];
    expect(second.text()).toContain("today");
    expect(second.text()).toContain("Oleta");
    expect(second.text()).toContain("$-83.13");
    expect(second.text()).toContain("Progressive");
    // Search
    wrapper.getComponent(PageHeader).vm.$emit("search", "net");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.getComponent(TransactionList).findAllComponents(MemberHeader).length).toBe(3);
  });
  it("renders single transaction", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/transactions/2d1985aa-d963-4c7d-bffd-89d7f9342b3c");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Emiliano");
    expect(text).toContain("GRP00000");
    expect(text).toContain("Oleta");
    expect(text).toContain("GRP00003");
    expect(text).toContain("$-49.37");
    expect(text).toContain("today at");
    expect(text).toContain("Polarised");
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
    expect(list.text()).toContain("Carol")
    const payer = list.findAllComponents(MemberHeader)[2]
    await payer.trigger("click")
    await flushPromises();
    await wrapper.get("[name='description']").setValue("Test transaction description.")
    await wrapper.get("[name='amount']").setValue("123")
    await wrapper.get("button[type='submit']").trigger("click")
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain("Carol");
    expect(text).toContain("Emiliano");
    expect(text).toContain("123");
    expect(text).toContain("Test transaction description.");
    expect(text).toContain("today")
    await wrapper.get("button[type='submit']").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")

  })
})