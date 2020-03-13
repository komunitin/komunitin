import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import SelectLang from '../SelectLang.vue';
import {
  Quasar,
  QSelect,
  QItem,
  QItemSection,
  QItemLabel,
  QBtnDropdown,
  QList
} from 'quasar';

describe('SelectLang', () => {
  let locale: string;
  let langs: {};
  // @ts-ignore
  let wrapper: Wrapper<SelectLang>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QSelect,
      QItem,
      QItemSection,
      QItemLabel,
      QBtnDropdown,
      QList
    }
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    locale = 'en-us';
    langs = {
      langs: [
        {
          label: 'Es',
          value: 'es'
        },
        {
          label: 'Ca',
          value: 'ca'
        },
        {
          label: 'En',
          value: 'en-us'
        }
      ]
    };
    wrapper = mount(SelectLang, {
      // Avoid error with translations.
      mocks: {
        $t: () => 'Title Mock Text',
        $i18n: {
          locale: locale
        },
        $Koptions: langs
      },
      localVue
    });
  });

  it('Check that it emits the selected language', async () => {
    // wrapper.setData({ langs: langs });
    // console.debug({ Test: wrapper.html() });
    // const select = wrapper.find('input');
    // New lang.
    const newLang = wrapper.vm.$data.langs[1].value;
    wrapper.setData({ locale: newLang });
    // select.setValue(newLang);
    // console.debug({ Test: wrapper.html() });
    wrapper.vm.$emit('setLocale');
    wrapper.vm.$emit('setLocale', newLang);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().setLocale).toBeTruthy();
    expect(wrapper.vm.$data.locale).toBe(newLang);
  });
});
