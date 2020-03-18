import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import ContactList from '../ContactList.vue';
import {
  Quasar,
  QCard,
  QItem,
  QAvatar,
  QIcon,
  QItemSection,
  QItemLabel,
  QList
} from 'quasar';

describe('ContactList', () => {
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
  let wrapper: Wrapper<ContactList>;

  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue();

  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {
    components: { QCard, QItem, QAvatar, QIcon, QItemSection, QItemLabel, QList}
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

    wrapper = mount(ContactList, {
      propsData: {
        waysContact: waysContact
      },
      localVue
    });
  });

  it('Html generated', async () => {
    // Test rendering.
    expect(wrapper.text()).toContain('+34 666 77 88 99');
  });

  it('Contact click', async () => {
    // Mock window.open function.
    delete window.open;
    window.open = jest.fn();
    wrapper.find({ref: 'phone'}).trigger('click');
    // Wait for event to be handled.
    await wrapper.vm.$nextTick();
    expect(window.open).toHaveBeenCalledWith('tel:'+encodeURIComponent('+34 666 77 88 99'), '_blank');
  });
});
