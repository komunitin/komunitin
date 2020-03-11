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
  QInput
} from 'quasar';

/**
 * Problems with mount does not allow me to do tests, for now I
 * leave it that way until I find a solution.
 *
 * @todo Check error display.
 * @todo Check contact list.
 * @todo share button.
 * @todo button send message.
 */

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
      QInput
    }
  });

  beforeEach(() => {
    id = '1';
    notifyList = [{}];
    errorsList;

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

  it('Check isLoading true', () => {
    expect(wrapper.vm.$data.isLoading).toBe(true);
  });

  // it('Check isLoading false', async () => {
  // wrapper.vm.$data.isLoading = true;
  // await wrapper.vm.$nextTick();
  // console.log({ Html: wrapper.html() });
  // console.log({ Data: wrapper.vm.$data.group });
  // expect(wrapper.vm.$data.isLoading).toBe(false);
  // });

  it('Check lists', () => {
    console.log({ errorsList: errorsList });
    console.log({ notifyList: notifyList });
  });
});
