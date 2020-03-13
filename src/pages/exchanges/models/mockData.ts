import { GroupsListModel, GroupModel } from './model';
import { LoremIpsum, ILoremIpsumParams } from 'lorem-ipsum';

const loremOptions: ILoremIpsumParams = {
  format: 'html' // "plain" or "html"
  // paragraphLowerBound: 3, // Min. number of sentences per paragraph.
  // paragraphUpperBound: 7, // Max. number of sentences per paragarph.
  // sentenceLowerBound: 5, // Min. number of words per sentence.
  // sentenceUpperBound: 15, // Max. number of words per sentence.
  // suffix: '\n' // Line ending, defaults to "\n" or "\r\n" (win32)
};

const lorem = new LoremIpsum(loremOptions);

// lorem.generateWords(1);
// lorem.generateSentences(5);
// lorem.generateParagraphs(7);

// Images.
const testImages = [
  'https://cdn.pixabay.com/photo/2019/12/12/13/42/castle-4690710__340.jpg',
  'https://cdn.pixabay.com/photo/2019/12/26/05/10/pink-4719682__340.jpg',
  'https://cdn.pixabay.com/photo/2020/02/07/19/05/galaxy-4828098__340.jpg',
  'https://cdn.pixabay.com/photo/2020/02/06/15/31/tiger-4824663__340.png',
  'https://cdn.pixabay.com/photo/2020/01/20/05/54/one-4779562__340.jpg',
  'https://cdn.pixabay.com/photo/2019/12/06/14/01/sea-4677421__340.jpg',
  'https://cdn.pixabay.com/photo/2019/07/30/17/38/koala-4373467__340.jpg',
  'https://cdn.pixabay.com/photo/2020/03/01/19/28/heart-4893891__340.png',
  'https://cdn.pixabay.com/photo/2020/02/29/17/14/wallpaper-4890663__340.jpg',
  'https://cdn.pixabay.com/photo/2020/03/02/04/52/people-4894818__340.png',
  'https://cdn.pixabay.com/photo/2020/02/26/23/25/ancient-4882999__340.jpg'
];

// Locations.
const testLocations = [
  {
    name: 'Cremallera de Montserrat',
    type: 'Point',
    coordinates: [41.5922793, 1.8342942]
  },
  {
    name: 'Torre Eiffel',
    type: 'Point',
    coordinates: [48.8583736, 2.2922873]
  },
  {
    name: 'Les Olives',
    type: 'Point',
    coordinates: [42.1050622, 3.0157955]
  },
  {
    name: 'Playa de La Concha',
    type: 'Point',
    coordinates: [43.3178579, -1.9882534]
  },
  {
    name: 'Cremallera de Montserrat',
    type: 'Point',
    coordinates: [41.5922793, 1.8342942]
  }
];

export function mockGroupsList(): GroupsListModel[] {
  const list = [];

  for (let index = 0; index < 10; index++) {
    list.push({
      id: index,
      data: {
        attributes: {
          code: 'COD' + index,
          name: lorem.generateWords(Math.round(Math.random() * 2) + 1),
          description: lorem.generateParagraphs(
            Math.round(Math.random() * 4) + 1
          ),
          image: testImages[Math.round(Math.random() * testImages.length)],
          website: 'https://easterislandexchange.org',
          access: 'public',
          location: {
            ...testLocations[Math.round(Math.random() * testLocations.length)]
          }
        }
      }
    });
  }
  // @ts-ignore
  return list;
}

export const mockGroup: GroupModel[] = [
  {
    data: {
      id: '84278843-50d5-4358-bbf7-a833ea5cde07',
      type: 'exchanges',
      attributes: {
        code: 'EITE',
        name: 'Easter Island Talent Exchange',
        description: `
          <p>Here at <strong>Easter Island</strong> it makes a lot of sense to
          have a local currency because Mauris et accumsan urna. Phasellus
          dictum dolor non nulla placerat porta. In sed egestas nibh. Aenean
          sit amet nunc quis risus varius consequat. Integer posuere auctor
          ipsum. Maecenas vehicula tellus non sapien lobortis aliquam.</p>
            
          <p>Morbi pharetra ultrices tempus. Donec volutpat lorem in justo
          molestie, vel lacinia odio rutrum. Nulla a libero tempus, fermentum
          arcu at, tempus urna. Pellentesque sit amet venenatis mauris.</p>
          `,
        image:
          'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/mystic-mountain-300x300.png',
        website: 'https://easterislandexchange.org',
        mail: 'mailadmingroup@dom.com',
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
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffw',
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
          id: '193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb',
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
          id: '193e98b4-a27d-4e8a-9a47-sdsdsdsdsdsd',
          attributes: {
            type: 'telegram',
            name: 'telegramUser'
          }
        }
      }
    ]
  }
];
