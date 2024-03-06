import { VueWrapper } from "@vue/test-utils";
import { seeds } from "src/server";
import { mountComponent } from "../utils";
import App from "../../../src/App.vue";

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
    

  })
})