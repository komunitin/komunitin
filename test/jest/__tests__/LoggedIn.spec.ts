import { VueWrapper } from "@vue/test-utils";
import { seeds } from "src/server";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";

describe("logged in", () => {
  let wrapper: VueWrapper;

  beforeAll(async () => {
    seeds();
    wrapper = await mountComponent(App, { login: true });
  });
  afterAll(() => wrapper.unmount());

  it("redirects when logged in", async() => {
    // Wait for the redirect.
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups/GRP0/needs");
  });
  it("renders Group, member and account data", async() => {
    const text = wrapper.text();
    // Member name
    expect(text).toContain("Tomasa Nikolaus");
    // Acount number
    expect(text).toContain("GRP00000");
    // Group name
    expect(text).toContain("Group 0");
  })
});