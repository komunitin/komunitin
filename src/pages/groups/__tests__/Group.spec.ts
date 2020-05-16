import { Wrapper } from "@vue/test-utils";
import { mountComponent } from "../../../../test/jest/utils";
import Group from "../Group.vue";

describe("Group.vue", () => {
  let code: string;
  let wrapper: Wrapper<Group & {isLoading?: boolean, group?: Group}>;

  beforeAll(async () => {
    code = "GRP1";
    wrapper = await mountComponent(Group, {
      propsData: {
        code
      }
    });
  });

  it("check receive data", async () => {
    expect(wrapper.vm.isLoading).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.group).toBeTruthy();
  });
});
