declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      navigator: {
        geolocation: {};
      };
    }
  }
}
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import GroupsList from '../GroupsList.vue';

import {
  Quasar,
  QLayout,
  QHeader,
  QPageContainer,
  QBtn,
  QToolbar,
  QToolbarTitle,
  QInput,
  QCard,
  QCardSection,
  QCardActions,
  QItem,
  QItemLabel,
  QItemSection,
  QAvatar
} from 'quasar';

describe('GroupsList.vue', () => {
  // let isLoading: boolean;
  let wrapper: Wrapper<GroupsList>;
  // let wrapper;
  let errorsList: [Error, string];
  let notifyList: [{}];

  const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementationOnce(success =>
      Promise.resolve(
        success({
          coords: {
            latitude: 30,
            longitude: -105,
            speed: null,
            accuracy: 1,
            altitudeAccuracy: null,
            heading: null,
            altitude: null
          },
          timestamp: Date.now()
        })
      )
    )
  };
  global.navigator.geolocation = mockGeolocation;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: {
      QLayout,
      QHeader,
      QPageContainer,
      QBtn,
      QToolbar,
      QToolbarTitle,
      QInput,
      QCard,
      QCardSection,
      QCardActions,
      QItem,
      QItemLabel,
      QItemSection,
      QAvatar
    }
  });

  beforeEach(() => {
    errorsList = [new Error(), 'Init'];
    notifyList = [{}];

    require('../../../services/mirage.js');
    wrapper = shallowMount(GroupsList, {
      // Avoid error with translations.
      mocks: {
        $t: () => 'Mock text',
        $errorsManagement: {
          getErrors() {
            return {
              message: 'MockErrorMessage'
            };
          },
          // newError (e: Error, area: string) {
          newError(e: Error, area: string) {
            errorsList.push(e, area);
          }
        },
        $q: {
          notify(options: object) {
            notifyList.push(options);
          }
        }
      },
      localVue
    });
  });

  it('Check isLoading false', async () => {
    expect(wrapper.vm.$data.isLoading).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).getGroups(1, 10);
    expect(wrapper.vm.$data.isLoading).toBe(false);
  });

  it('Check data', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).getGroups(1, 10);
    expect(wrapper.vm.$data.groups).toHaveLength(10);
  });
});
