import GroupList from "../GroupList.vue";
import { Wrapper } from "@vue/test-utils";
import { mountComponent } from "../../../../test/jest/utils";
import { QInnerLoading } from "quasar";
import GroupCard from "../../../components/GroupCard.vue";

describe("GroupsList.vue", () => {
  let wrapper: Wrapper<Vue>;

  beforeAll(async () => {
    wrapper = await mountComponent(GroupList);
  });
  afterAll(() => wrapper.destroy);

  it("Check loading spinner", async () => {
    expect(wrapper.find(QInnerLoading).isVisible()).toBe(true);
    await wrapper.vm.$wait();
    expect(wrapper.vm.$data.isLoading).toBe(false);
  });

  it("Check data", async () => {
    await wrapper.vm.$wait();
    expect(wrapper.findAll(GroupCard)).toHaveLength(10);
  });
});
