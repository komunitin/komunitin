import { flushPromises, VueWrapper } from "@vue/test-utils";
import App from "src/App.vue";
import { mountComponent, waitForEqual } from "../utils";
import TransactionList from "src/pages/transactions/TransactionList.vue";
import AccountHeader from "src/components/AccountHeader.vue";
import SelectAccount from "src/components/SelectAccount.vue";
import PageHeader from "src/layouts/PageHeader.vue";
import { seeds } from "src/server";
import { QList, QMenu } from "quasar";
import SelectGroup from "src/components/SelectGroup.vue";
import GroupHeader from "src/components/GroupHeader.vue";

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
    const transactions = wrapper.getComponent(TransactionList).findAllComponents(AccountHeader)
    expect(transactions.length).toBe(20);
    const first = transactions[5];
    expect(first.text()).toContain("Rejected");
    expect(first.text()).toContain("Florida");
    expect(first.text()).toContain("$-17.88");
    expect(first.text()).toContain("holistic");

    const second = transactions[1];
    expect(second.text()).toContain("today");
    expect(second.text()).toContain("Oleta");
    expect(second.text()).toContain("$33.01");
    expect(second.text()).toContain("challenge");
    // Search
    wrapper.getComponent(PageHeader).vm.$emit("search", "open");
    await wrapper.vm.$wait();
    // Check result!
    expect(wrapper.getComponent(TransactionList).findAllComponents(AccountHeader).length).toBe(2);
  });
  it("renders single transaction", async () => {
    await wrapper.vm.$router.push("/groups/GRP0/transactions/6d9c00a8-4304-4371-ac11-83da505abd4e");
    await wrapper.vm.$wait();
    const text = wrapper.text();
    expect(text).toContain("Emiliano");
    expect(text).toContain("GRP00000");
    expect(text).toContain("Oleta");
    expect(text).toContain("GRP00003");
    expect(text).toContain("$33.01");
    expect(text).toContain("today at");
    expect(text).toContain("heuristic");
    expect(text).toContain("Committed");
    expect(text).toContain("Group 0");
  })
  it("creates payment request", async () =>  {
    await wrapper.vm.$router.push("/login");
    await flushPromises();
    // Click transactions link
    await wrapper.get("#menu-transactions").trigger("click");
    await flushPromises();
    await wrapper.get("#request-payment").trigger("click");
    await flushPromises();
    expect(wrapper.vm.$route.fullPath).toBe("/groups/GRP0/members/EmilianoLemke57/transactions/receive");
    await wrapper.vm.$wait()
    await wrapper.getComponent(SelectAccount).get('input').trigger("click");
    await wrapper.vm.$wait()

    const dialog = wrapper.getComponent(SelectAccount).getComponent(QMenu)
    const payer = dialog.findAllComponents(AccountHeader)[2]
    expect(payer.text()).toContain("Carol")
    await payer.trigger("click")
    await flushPromises();
    await wrapper.get("[name='description']").setValue("Test transaction description.")
    const button = wrapper.get("button[type='submit']")
    expect(button.attributes("disabled")).toBeDefined()
    await wrapper.get("[name='amount']").setValue("123")
    expect(button.attributes("disabled")).toBeUndefined()

    await button.trigger("click")
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain("Carol")
    expect(text).toContain("Emiliano")
    expect(text).toContain("123")
    expect(text).toContain("Test transaction description.")
    expect(text).toContain("today")
    expect(text).toContain("New")


    await wrapper.get("#confirm-transaction").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")

  })

  it("creates payment", async() => {
    await wrapper.vm.$router.push("/groups/GRP0/members/EmilianoLemke57/transactions/send")
    await wrapper.vm.$wait();

    await wrapper.getComponent(SelectAccount).get('input').trigger("click");
    await flushPromises()
    await wrapper.vm.$wait()

    const dialog = wrapper.getComponent(SelectAccount).getComponent(QMenu)
    const payee = dialog.findAllComponents(AccountHeader)[2]
    expect(payee.text()).toContain("Carol")
    await payee.trigger("click")
    await flushPromises();

    await wrapper.get("[name='description']").setValue("Test payment description.")
    await wrapper.get("[name='amount']").setValue("234")
    await wrapper.get("button[type='submit']").trigger("click")
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain("Carol");
    expect(text).toContain("Emiliano");
    expect(text).toContain("234");
    expect(text).toContain("Test payment description.");
    expect(text).toContain("today")
    await wrapper.get("#confirm-transaction").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")
  })

  it("creates external payment - account list", async() => {
    await wrapper.vm.$router.push("/groups/GRP0/members/EmilianoLemke57/transactions/send")
    await wrapper.vm.$wait();

    await wrapper.getComponent(SelectAccount).get('input').trigger("click");
    await flushPromises()
    await wrapper.vm.$wait()

    const dialog = wrapper.getComponent(SelectAccount).getComponent(QMenu)
    const groups = dialog.getComponent(SelectGroup)
    await groups.trigger("click")
    // Choose group 1
    await groups.getComponent(QList).findAllComponents(GroupHeader)[1].trigger("click")
    await flushPromises()
    await wrapper.vm.$wait()
    const payee = dialog.findAllComponents(AccountHeader)[1]
    expect(payee.text()).toContain("Jaunita")
    await payee.trigger("click")
    await flushPromises();

    await wrapper.get("[name='description']").setValue("Test external payment")
    await wrapper.get("[name='amount']").setValue("12")
    await flushPromises()
    expect((wrapper.get("input[aria-label='Amount in sensors']").element as HTMLInputElement).value).toEqual("120.00")

    await wrapper.get("button[type='submit']").trigger("click")
    await flushPromises();
    
    const text = wrapper.text();
    expect(text).toContain("Jaunita");
    expect(text).toContain("Emiliano");
    expect(text).toContain("$-12.00");
    expect(text).toContain("($-120.00)");
    expect(text).toContain("Test external payment");
    expect(text).toContain("today")

    await wrapper.get("#confirm-transaction").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")
  })

  it("creates external payment - no list", async() => {
    await wrapper.vm.$router.push("/groups/GRP0/members/EmilianoLemke57/transactions/send")
    await wrapper.vm.$wait();

    const input = wrapper.getComponent(SelectAccount).get('input')
    await input.trigger("click");
    await flushPromises()
    await wrapper.vm.$wait()

    const dialog = wrapper.getComponent(SelectAccount).getComponent(QMenu)
    const groups = dialog.getComponent(SelectGroup)
    await groups.trigger("click")
    // Choose group 2
    const group2 = groups.getComponent(QList).findAllComponents(GroupHeader)[2]
    expect(group2.text()).toContain("Group 2")
    await group2.trigger("click")
    await flushPromises()
    await wrapper.vm.$wait()
    // No accounts
    expect(dialog.findAllComponents(AccountHeader).length).toBe(0)
    
    await input.setValue("002")
    const wait = await waitForEqual(() => dialog.findAllComponents(AccountHeader).length, 1)
    expect(wait).toBeTruthy()
    // Found account
    await input.trigger("keydown.enter")
    await wrapper.vm.$wait()

    await wrapper.get("[name='description']").setValue("Test external payment 2")
    await wrapper.get("[name='amount']").setValue("13")
    await flushPromises()
    await wrapper.vm.$wait();
    expect((wrapper.get("input[aria-label='Amount in programs']").element as HTMLInputElement).value).toEqual("1,300.00")

    await wrapper.get("button[type='submit']").trigger("click")
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain("GRP20002");
    expect(text).toContain("Emiliano");
    expect(text).toContain("$-13.00");
    expect(text).toContain("(R$-1,300.00)");
    expect(text).toContain("Test external payment 2");
    expect(text).toContain("today")

    await wrapper.get("#confirm-transaction").trigger("click")
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Committed")
  })
})