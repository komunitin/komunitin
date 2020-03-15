import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import ContactCard from '../ContactCard.vue';
import {
  Quasar,
  QCard,
  QItem,
  QAvatar,
  QIcon,
  QItemSection,
  QItemLabel
} from 'quasar';

describe('ContactCard', () => {
  let waysContact: {
    links: {
      self: string;
    };
    data: {
      type: string;
      id: string;
      attributes: {
        type: string;
        name: string;
      };
    };
  }[];
  // @ts-ignore
  let wrapper: Wrapper<ContactCard>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QCard, QItem, QAvatar, QIcon, QItemSection, QItemLabel }
  });

  // Montamos el componente con los props necesarios antes de cada test.
  beforeEach(() => {
    waysContact = [
      {
        links: {
          self:
            'https://komunitin.org/EITE/contacts/7ceb75eb-9da0-4746-bb61-a34e0be49112'
        },
        data: {
          type: 'contacts',
          id: '7ceb75eb-9da0-4746-bb61-a34e0be49112',
          attributes: {
            type: 'phone',
            name: '+34 666 77 88 99'
          }
        }
      },
      {
        links: {
          self:
            'https://komunitin.org/EITE/contacts/193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb'
        },
        data: {
          type: 'contacts',
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffq',
          attributes: {
            type: 'email',
            name: 'exhange@easterisland.com'
          }
        }
      },
      {
        links: {
          self:
            'https://komunitin.org/EITE/contacts/193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb'
        },
        data: {
          type: 'contacts',
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffw',
          attributes: {
            type: 'whatsapp',
            name: '+34 666 66 66 66'
          }
        }
      },
      {
        links: {
          self:
            'https://komunitin.org/EITE/contacts/193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb'
        },
        data: {
          type: 'contacts',
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb',
          attributes: {
            type: 'telegram',
            name: '@example'
          }
        }
      },
      {
        links: {
          self:
            'https://komunitin.org/EITE/contacts/193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb'
        },
        data: {
          type: 'contacts',
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffs',
          attributes: {
            type: 'Undefined',
            name: 'undefinedNameOfContact'
          }
        }
      }
    ];

    wrapper = shallowMount(ContactCard, {
      propsData: {
        waysContact: waysContact
      },
      localVue
    });
  });

  // it('should match snapshot', () => {
  //   expect(wrapper).toMatchSnapshot();
  // });

  it('Html generated', async () => {
    // await wrapper.vm.$nextTick();
    // console.debug({ Test: wrapper.html() });
    expect(wrapper.html()).toContain('tel:');
  });
});
