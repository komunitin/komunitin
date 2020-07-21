import { createLocalVue, shallowMount } from "@vue/test-utils";
import AccountLimits from "../AccountLimits.vue";
import {Quasar, QSeparator} from 'quasar'
import FormatCurrency from "../../../plugins/FormatCurrency";

describe('AccountLimits.vue', () => {
  const localVue = createLocalVue();
  localVue.use(Quasar, {components: {QSeparator}})
  localVue.use(FormatCurrency);

  const mocks = {
    $t: (key: string, value: {amount: number}) => `${key} ${value.amount}`,
    $n: (n: number) => n + '',
  };
  const currency = {
    attributes: {
      decimals: 2,
      scale: 2,
      symbol: "%"
    }
  }

  it("renders credit limit", () => {
    const account = {
      attributes: {
        creditLimit: 5000,
        debitLimit: -1
      },
      currency
    };
    const wrapper = shallowMount(AccountLimits, {
      localVue,
      propsData: {
        account
      },
      mocks
    });
    expect(wrapper.text()).toBe("maxAmount 50 %");
    expect(wrapper.find(QSeparator).exists()).toBe(false);
  });

  it("renders debit limit", () => {
    const account = {
      attributes: {
        debitLimit: 5000,
        creditLimit: -1
      },
      currency
    };
    const wrapper = shallowMount(AccountLimits, {
      localVue,
      propsData: {
        account
      },
      mocks
    });
    expect(wrapper.text()).toBe("minAmount -50 %");
    expect(wrapper.find(QSeparator).exists()).toBe(false);
  });

  it("renders both limits", () => {
    const account = {
      attributes: {
        debitLimit: 5000,
        creditLimit: 6000
      },
      currency
    };
    const wrapper = shallowMount(AccountLimits, {
      localVue,
      propsData: {
        account
      },
      mocks
    });
    expect(wrapper.text()).toContain("minAmount -50 %");
    expect(wrapper.text()).toContain("maxAmount 60 %");
    expect(wrapper.find(QSeparator).exists()).toBe(true);
  });

})
