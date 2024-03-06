import { VueWrapper, flushPromises } from "@vue/test-utils";
import { seeds } from "src/server";
import { mountComponent } from "../utils";
import App from "../../../src/App.vue";
import GroupCard from "../../../src/components/GroupCard.vue";

describe("Signup", () => {
  let wrapper: VueWrapper;
  
  beforeAll(async () => {  
    seeds();
    wrapper = await mountComponent(App);
    
  });

  afterAll(() => {
    wrapper.unmount();
  });

  it("Creates user", async () => {
    await wrapper.vm.$router.push("/");
    wrapper.get("#explore").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups");
    await wrapper.getComponent(GroupCard).get("a[href='/groups/GRP0/signup']").trigger("click");
    await wrapper.vm.$wait();
    
    expect(wrapper.vm.$route.path).toBe("/groups/GRP0/signup");
    expect(wrapper.text()).toContain("Membership terms");
    expect(wrapper.text()).toContain("Group 0");
    expect(wrapper.text()).toContain("Voluptatibus");
    await wrapper.get("button[type='submit']").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Set your credentials");
    await wrapper.get("[name='name']").setValue("User Test");
    await wrapper.get("[name='email']").setValue("user@example.com");
    await wrapper.get("[name='password']").setValue("password");
    await wrapper.get("button[type='submit']").trigger("click");
    await flushPromises();
    await wrapper.vm.$wait();
    expect(wrapper.text()).toContain("Verify your email");
  })

  it('Creates member', async () => {

  })
  
})