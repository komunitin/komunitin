import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import Exchange from '../Exchange.vue';

import {
  Quasar,
  QLayout,
  QPageContainer,
  QHeader,
  QBtn,
  QToolbar,
  QToolbarTitle,
  QInput,
  QDialog,
  QImg,
  QCard,
  QCardSection,
  QIcon,
  QSeparator
} from 'quasar';

describe('Exchange.vue', () => {
  let id: string;
  // let group: object;
  // let isLoading: boolean;
  // @ts-ignore
  let wrapper: Wrapper<Exchange>;
  let errorsList: [Error, string];
  let notifyList: [{}];

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QLayout,
      QPageContainer,
      QHeader,
      QBtn,
      QToolbar,
      QToolbarTitle,
      QInput,
      QDialog,
      QImg,
      QCard,
      QCardSection,
      QIcon,
      QSeparator
    }
  });

  beforeEach(() => {
    id = '1';
    notifyList = [{}];
    errorsList = [new Error(), 'Init'];

    require('../../../services/mirage.js');

    wrapper = shallowMount(Exchange, {
      propsData: {
        id: id
      },
      mocks: {
        // Avoid error with translations.
        $t: () => 'Title Mock Text',
        $errorsManagement: {
          getErrors() {
            return {
              message: 'MockErrorMessage'
            };
          },
          newError(e: Error, area: string) {
            // console.log({ area: area, e: e });
            errorsList.push(e, area);
          }
        },
        $q: {
          notify(options: {}) {
            // console.log({ NotifyOptions: options });
            notifyList.push(options);
          }
        }
      },
      localVue
    });
  });

  it('check receive data', async () => {
    expect(wrapper.vm.$data.isLoading).toBe(true);
    // @ts-ignore
    await wrapper.vm.collectExchange('1');
    expect(wrapper.vm.$data.isLoading).toBe(false);
    expect(wrapper.vm.$data.group).toBeTruthy();
  });
});
