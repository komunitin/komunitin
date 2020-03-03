import { ExchangesListModel, ExchangeModel } from './model';

export const mockExchangesList: ExchangesListModel[] = [
  {
    id: 1,
    name: 'Echange 1',
    code: 'EXEM',
    description: `
      Aliqua sint adipisicing cillum deserunt quis. Consequat magna dolor eiusmod ea fugiat duis cupidatat. Quis nulla amet magna dolore et irure excepteur.    
    `,
    accounts: 120,
    logo:
      'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/mystic-mountain-300x300.png',
    attributes: {
      location: {
        name: 'Cremallera de Montserrat',
        type: 'Point',
        coordinates: [41.5922793, 1.8342942]
      }
    }
  },
  {
    id: 2,
    name: 'Echange 2',
    code: 'EXE2',
    description: `
      Ut proident sit sint anim exercitation veniam duis occaecat fugiat exercitation exercitation qui ea eiusmod. Veniam dolor reprehenderit dolore culpa duis laboris tempor ad enim aliquip eu id ut ex. Eiusmod ad sit veniam mollit reprehenderit sint quis dolore qui ullamco sunt qui et. Aute esse officia excepteur exercitation duis aliquip aute ex in aute. Cillum excepteur eu deserunt consectetur adipisicing. Ipsum ex cupidatat pariatur dolore cupidatat commodo ut.

      Do voluptate aliquip nisi nisi et. Cillum magna do ea officia enim consectetur. In occaecat aliqua dolore elit.

      Dolore commodo proident anim anim eiusmod sint. Elit laboris irure enim duis laborum culpa ea excepteur excepteur. Amet occaecat incididunt Lorem in mollit excepteur do aliquip. Id sint reprehenderit ut aliquip anim irure. Eu reprehenderit laborum cupidatat commodo pariatur anim aliqua excepteur ad in excepteur exercitation.
    `,
    accounts: 150,
    attributes: {
      location: {
        name: 'Torre Eiffel',
        type: 'Point',
        coordinates: [48.8583736, 2.2922873]
      }
    },
    logo:
      'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/colorpro.png'
  },
  {
    id: 3,
    name: 'Echange 3',
    code: 'EXE3',
    description: `
      Aliqua sint adipisicing cillum deserunt quis. Consequat magna dolor eiusmod ea fugiat duis cupidatat. Quis nulla amet magna dolore et irure excepteur.    
    `,
    accounts: 620,
    attributes: {
      location: {
        name: 'Les Olives',
        type: 'Point',
        coordinates: [42.1050622, 3.0157955]
      }
    },
    logo:
      'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/femme-foto-300x300.png'
  },
  {
    id: 4,
    name: 'Echange 4',
    code: 'EXE4',
    description: `
      Aliqua sint adipisicing cillum deserunt quis. Consequat magna dolor eiusmod ea fugiat duis cupidatat. Quis nulla amet magna dolore et irure excepteur.    
    `,
    accounts: 120,
    attributes: {
      location: {
        name: 'Playa de La Concha',
        type: 'Point',
        coordinates: [43.3178579, -1.9882534]
      }
    },
    logo:
      'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/whatcom.png'
  }
];

export const mockExchange: ExchangeModel[] = [
  {
    data: {
      id: '84278843-50d5-4358-bbf7-a833ea5cde07',
      type: 'exchanges',
      attributes: {
        code: 'EITE',
        name: 'Easter Island Talent Exchange',
        description:
          '<p>Here at <strong>Easter Island</strong> it makes a lot of sense to have a local currency because bla bla bla...',
        image:
          'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/mystic-mountain-300x300.png',
        website: 'https://easterislandexchange.org',
        access: 'public',
        location: {
          name: 'Easter Island',
          type: 'Polygon',
          bbox: [
            -109.48974609375,
            -27.221662326867037,
            -109.20616149902344,
            -27.024877476307523
          ],
          coordinates: [
            [
              [41.8667, 2.6667],
              [-109.44236755371094, -27.201510867989075],
              [-109.23294067382812, -27.108033801463105],
              [-109.3798828125, -27.054233808785824]
            ]
          ]
        }
      },
      relatinships: {
        contacts: {
          data: [
            {
              type: 'contacts',
              id: '7ceb75eb-9da0-4746-bb61-a34e0be49112'
            },
            {
              type: 'contacts',
              id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb'
            }
          ]
        },
        members: {
          links: {
            related: 'https://komunitin.org/EITE/members'
          },
          meta: {
            count: 105
          }
        },
        categories: {
          links: {
            related: 'https://komunitin.org/EITE/categories'
          },
          meta: {
            count: 2
          }
        },
        offers: {
          links: {
            related: 'https://komunitin.org/EITE/offers'
          },
          meta: {
            count: 170
          }
        },
        needs: {
          links: {
            related: 'https://komunitin.org/EITE/needs'
          },
          meta: {
            count: 6
          }
        },
        posts: {
          links: {
            related: 'https://komunitin.org/EITE/posts'
          },
          meta: {
            count: 432
          }
        }
      },
      links: {
        self: 'https://komunitin.org/EITE'
      },
      meta: {
        created: '2011-08-19T23:15:30.000Z',
        updated: '2020-08-19T23:15:30.000Z'
      }
    },
    included: [
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
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb',
          attributes: {
            type: 'email',
            name: 'exhange@easterisland.com'
          }
        }
      }
    ]
  }
];
