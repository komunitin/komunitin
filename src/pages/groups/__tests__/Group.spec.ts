import { Wrapper } from "@vue/test-utils";
import { mountComponent } from "../../../../test/jest/utils";
import GroupComponent from "../Group.vue";
import { Group } from "../../../store/model";

describe("Group.vue", () => {
  let code: string;
  let wrapper: Wrapper<Vue & {isLoading?: boolean, group?: Group}>;

  beforeAll(async () => {
    code = "GRP1";
    wrapper = await mountComponent(GroupComponent, {
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
