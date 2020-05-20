/**
 * @jest-environment jsdom
 */
import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";
import MenuDrawer from "../../../src/components/MenuDrawer.vue";

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
    // Vue needs an additional nextTick()'s to render the content
    // got through router.
    await wrapper.vm.$nextTicks();
    expect(wrapper.vm.$route.path).toBe("/login-select");
    // Click Login with email button.
    wrapper.get("#login_mail").trigger("click");
    await wrapper.vm.$nextTicks();
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

  it("login and logout", async () => {
    expect(wrapper.vm.$store.getters.isLoggedIn).toBe(false);
    // Go to login with mail page.
    wrapper.vm.$router.push("/login-mail");
    await wrapper.vm.$nextTicks();
    // Button is disabled since form is empty.
    expect(wrapper.find("button[type='submit']").attributes().disabled)
      .toBe("disabled");
    wrapper.find("input[type='email']").setValue("example@example.com");
    wrapper.find("input[type='password']").setValue("password");
    await wrapper.vm.$nextTick();
    // Button is enabled now.
    expect(
      wrapper.find("button[type='submit']").attributes().disabled
    ).toBeUndefined();
    wrapper.find("button[type='submit']").trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$store.getters.isLoggedIn).toBe(true);
    expect(wrapper.vm.$route.path).toBe("/groups/GRP0");
    // Click the account switcher
    wrapper
      .find("#my-member")
      .find("button")
      .trigger("click");
    await wrapper.vm.$nextTick();
    // Click logout
    wrapper
      .find(MenuDrawer)
      .find({ ref: "logout" })
      .trigger("click");
    await wrapper.vm.$wait();
    expect(wrapper.vm.$store.getters.isLoggedIn).toBe(false);
    expect(wrapper.vm.$route.path).toBe("/");
  });
});
