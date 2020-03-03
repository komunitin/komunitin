import { GroupsListModel, GroupModel } from './model';
import { LoremIpsum } from 'lorem-ipsum';

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

// lorem.generateWords(1);
// lorem.generateSentences(5);
// lorem.generateParagraphs(7);

export function mockGroupsList(): GroupsListModel[] {
  const list = [];

  for (let index = 0; index < 11; index++) {
    list.push({
      id: index,
      data: {
        attributes: {
          code: 'COD' + index,
          name: lorem.generateWords(Math.round(Math.random() * 2) + 1),
          description: lorem.generateParagraphs(
            Math.round(Math.random() * 4) + 1
          ),
          image:
            'https://www.deluxe.com/sites/www.deluxe.com/files/logo_design/logo/mystic-mountain-300x300.png',
          website: 'https://easterislandexchange.org',
          access: 'public',
          location: {
            name: 'Cremallera de Montserrat',
            type: 'Point',
            coordinates: [41.5922793, 1.8342942]
          }
        }
      }
    });
  }
  console.log(list);
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
