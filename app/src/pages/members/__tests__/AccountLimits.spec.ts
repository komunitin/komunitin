import { shallowMount } from "@vue/test-utils";
import AccountLimits from "../AccountLimits.vue";
import {Quasar, QSeparator} from 'quasar'
import { config } from '@vue/test-utils';
import { createI18n } from "vue-i18n";

// Install quasar (only with 1 component).
config.global.plugins.unshift([Quasar, {
  components: {
    QSeparator
  }
}]);
// Install i18n.
const i18n = createI18n({
  legacy: false
})
config.global.plugins.unshift([i18n])

describe('AccountLimits.vue', () => {
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
      props: {
        account
      },
      global: {
        mocks
      }
    });
    expect(wrapper.text()).toBe("maxAmount %50");
    expect(wrapper.findComponent(QSeparator).exists()).toBe(false);
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
      props: {
        account
      },
      global: {
        mocks
      },
    });
    expect(wrapper.text()).toBe("minAmount %-50");
    expect(wrapper.findComponent(QSeparator).exists()).toBe(false);
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
      propsData: {
        account
      },
      global: {
        mocks
      }
    });
    expect(wrapper.text()).toContain("minAmount %-50");
    expect(wrapper.text()).toContain("maxAmount %60");
    expect(wrapper.findComponent(QSeparator).exists()).toBe(true);
  });

})
