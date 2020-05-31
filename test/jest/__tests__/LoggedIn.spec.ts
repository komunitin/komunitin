import { Wrapper } from "@vue/test-utils";
import App from "../../../src/App.vue";
import { mountComponent } from "../utils";

describe("logged in", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(App, { login: true });
  });

  it("redirects when logged in", async() => {
    // Wait for the redirect.
    await wrapper.vm.$wait();
    expect(wrapper.vm.$route.path).toBe("/groups/GRP0");
  });
  it("renders Group, member and account data", async() => {
    const text = wrapper.text();
    // Member name
    expect(text).toContain("Jayce Glover");
    // Acount number
    expect(text).toContain("GRP00000");
    // Group name
    expect(text).toContain("Group 0");
  })
});