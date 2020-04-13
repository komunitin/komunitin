/**
 * @jest-environment jsdom
 */
import { Wrapper } from '@vue/test-utils';
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";

describe("Front page and login", () => {
  let wrapper: Wrapper<Vue>;
  beforeAll(async () => {
    wrapper = await mountComponent(App);
  });
  afterAll(() => wrapper.destroy());
  
  it("has explore and login buttons", () => {
    const html = wrapper.html();
    expect(html).toContain("account_circle");
    expect(html).toContain("explore");
  });

  it("goes to login with mail and back to front page", async () => {
    expect(wrapper.vm.$route.path).toBe("/");
    expect(wrapper.find("#back").isVisible()).toBe(false);
    // Click login button.
    wrapper.get("#login").trigger("click");
    // Vue needs an additional nextTick() to render the content
    // got through router.
    await wrapper.vm.$nextTwoTicks();
    expect(wrapper.vm.$route.path).toBe("/login-select");
    // Click Login with email button.
    wrapper.get("#login_mail").trigger("click");
    await wrapper.vm.$nextTwoTicks();
    expect(wrapper.vm.$route.path).toBe("/login-mail");
    // Click back
    expect(wrapper.get("#back").isVisible()).toBe(true);
    wrapper.get("#back").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/login-select");
    // Click back again
    expect(wrapper.get("#back").isVisible()).toBe(true);
    wrapper.get("#back").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/");
  });

  it("logs in with email and password", async () => {
    expect(wrapper.vm.$auth.isAuthorized()).toBe(false);
    // Go to login with mail page.
    wrapper.vm.$router.push("/login-mail");
    await wrapper.vm.$nextTwoTicks();
    // Button is disabled since form is empty.
    expect(wrapper.find("button[type='submit']").attributes().disabled).toBe("disabled");
    wrapper.find("input[type='email']").setValue("example@example.com");
    wrapper.find("input[type='password']").setValue("password");
    await wrapper.vm.$nextTick();
    // Button is enabled now.
    expect(wrapper.find("button[type='submit']").attributes().disabled).toBeUndefined();
    wrapper.find("button[type='submit']").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$auth.isAuthorized()).toBe(true);
  });
  
});
