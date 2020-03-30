import {
  GroupSummary,
  Group,
  Location,
  CollectionResponse,
  ResourceResponseInclude,
  Contact,
  ResourceObject,
  ResourceIdentifierObject,
  RelatedCollection,
  Category,
  CategorySummary,
  Member,
  MemberSummary,
  Address
} from "./model";
import { LoremIpsum, ILoremIpsumParams } from "lorem-ipsum";
import { uid } from "quasar";
import KOptions from "../../../komunitin.json";

// Configuration
const BASE_URL = KOptions.apis.social;
const NUM_GROUPS = 11;

const loremOptions: ILoremIpsumParams = {
  format: "html" // "plain" or "html"
  // paragraphLowerBound: 3, // Min. number of sentences per paragraph.
  // paragraphUpperBound: 7, // Max. number of sentences per paragarph.
  // sentenceLowerBound: 5, // Min. number of words per sentence.
  // sentenceUpperBound: 15, // Max. number of words per sentence.
  // suffix: '\n' // Line ending, defaults to "\n" or "\r\n" (win32)
};

// Random text generator
const lorem = new LoremIpsum(loremOptions);

// Descriptions test.
const testDescriptions = [
  "Velit anim eu occaecat culpa **sunt amet amet laboris** amet laborum exercitation duis labore quis. Ullamco adipisicing deserunt sint adipisicing irure aliquip non consequat qui fugiat non dolor. In culpa consectetur ipsum irure do aute veniam aute occaecat labore. Labore aliqua esse consectetur anim. Minim ex consectetur elit minim fugiat officia cupidatat officia qui est qui ad magna exercitation.\nVoluptate proident reprehenderit sint eu consectetur ex *sunt qui eu nulla*. In et dolore nulla veniam enim. Reprehenderit sunt aliqua duis ex culpa. Eu aliqua reprehenderit tempor pariatur et amet nisi magna. Reprehenderit proident nulla sint dolore.\nReprehenderit pariatur `duis aliqua ipsum qui est id officia` fugiat nulla ipsum sit. Reprehenderit cillum quis ex ad consequat consectetur tempor velit aute laborum irure quis consequat. Deserunt dolor tempor enim officia fugiat magna eiusmod id. Esse non culpa ipsum commodo. Deserunt commodo sit reprehenderit esse deserunt fugiat tempor.",
  "**Anim enim sunt tempor** deserunt consequat qui dolore excepteur dolor. Eiusmod do eiusmod et sunt dolore eu cupidatat ea eu ea laboris non. Aliqua minim amet aliquip ad aliquip fugiat velit sunt cupidatat quis adipisicing. Proident amet deserunt anim aliquip est. Nulla et magna dolore nostrud non consequat consectetur do aliqua.\nOfficia qui ea *incididunt* id. Elit ullamco ut quis nisi nostrud consectetur id sit laborum excepteur incididunt eiusmod proident. Ut sunt anim elit ea ex excepteur laboris amet irure adipisicing aute. Quis cupidatat commodo ad elit elit tempor adipisicing nulla ea incididunt quis qui. Labore ut elit quis qui est. Exercitation esse ipsum cillum cillum officia eiusmod aute aliqua velit ea. Dolor do commodo culpa mollit ullamco nulla exercitation fugiat mollit nostrud.",
  "Non elit ex nostrud esse ea in occaecat minim et cupidatat exercitation duis incididunt. Ex in proident dolor nulla id pariatur cillum consectetur magna pariatur. Consectetur officia sunt proident labore laborum sit est consectetur sit deserunt do cillum nostrud Lorem.\nUllamco aliqua consequat laborum ipsum do mollit consequat. Nisi pariatur sit et **incididunt** commodo. Ex aliqua dolor ea sunt sint quis enim et commodo ut veniam.\n*Voluptate non consequat velit mollit* quis exercitation exercitation est eu tempor nisi aliquip. Enim nostrud ea magna occaecat ex voluptate nostrud do aliqua esse sit id. Elit laboris et proident sunt proident amet ea duis cupidatat in eu incididunt Lorem est.\nIrure ut duis consectetur elit ad. Lorem cillum ullamco aliqua ut sint. Laborum exercitation ea eiusmod minim magna in in nostrud consectetur in. **Elit qui duis aliqua** ipsum magna est tempor. Anim irure incididunt anim voluptate quis quis est ex sint. Qui duis laborum exercitation laborum fugiat mollit **minim occaecat** sint duis aute. Cupidatat do ad consequat id veniam mollit quis elit incididunt pariatur amet occaecat enim reprehenderit.",
  "*Commodo nulla ullamco eiusmod nisi* qui ipsum do quis. Adipisicing ex cupidatat irure Lorem laborum incididunt amet id incididunt elit quis et anim. Veniam id velit et esse cillum exercitation culpa do et ex ex nostrud nulla reprehenderit. Aute quis consectetur reprehenderit id Lorem fugiat mollit ad **cillum** voluptate excepteur. Eu in nulla dolore anim cupidatat non et amet irure.\nQui ex proident officia enim aute aliquip non dolore. Ad laboris mollit culpa nostrud adipisicing amet fugiat qui sit exercitation aliqua culpa aute anim. Elit **excepteur** esse exercitation Lorem ullamco nostrud sint exercitation id cupidatat. Tempor commodo ea nisi non pariatur ea amet. Dolore duis veniam est voluptate.\nDuis culpa velit do incididunt eu minim dolor ex culpa. Magna cillum esse do id magna. Consequat laborum laboris tempor consectetur magna voluptate deserunt qui. Consectetur consectetur exercitation esse cupidatat.\nDo laboris voluptate in magna ut amet pariatur cillum aliqua est aliquip pariatur consequat **reprehenderit. Laboris irure qui excepteur** occaecat mollit minim. Pariatur aliquip qui ullamco Lorem. In tempor officia ex incididunt ullamco ad. Adipisicing aute cillum duis labore eu dolor. Ullamco elit exercitation elit minim irure. Commodo magna excepteur amet fugiat do sunt.\nUllamco labore adipisicing incididunt duis id proident magna dolore exercitation esse irure voluptate officia ad. Proident nostrud proident cillum veniam *dolore. Ad in in aute labore incididunt* officia tempor laborum magna elit reprehenderit amet ut. Ad proident reprehenderit ullamco eiusmod aliquip adipisicing et duis consequat. Dolor non ex dolore consectetur incididunt ad incididunt qui voluptate sunt cillum irure excepteur.\nEa nulla occaecat mollit magna et tempor eu irure ipsum ut cupidatat irure. Magna aliqua quis velit labore est excepteur mollit. Eiusmod et magna officia laboris culpa est voluptate ullamco ipsum ad Lorem esse. Nulla exercitation tempor laboris incididunt pariatur voluptate occaecat eiusmod nisi sint eu **nostrud exercitation**. Excepteur nisi mollit culpa duis velit amet nulla irure est eiusmod voluptate aute eiusmod proident. Ullamco labore do duis officia duis nulla laboris nisi in ipsum esse culpa ipsum.",
  "Enim ut cillum sit officia.",
  "Eu laboris non Lorem deserunt. Ad dolor excepteur sit ipsum cillum amet adipisicing qui est sint Lorem. Aliquip eu commodo nostrud nisi ea. Occaecat id dolor laborum officia veniam pariatur reprehenderit velit **reprehenderit. Consequat dolore **laborum ea et ullamco ex. Ipsum veniam aute officia velit cupidatat incididunt qui nisi. In exercitation sint dolore enim nulla in nostrud elit incididunt id sunt est dolor adipisicing.",
  "Id enim enim esse adipisicing sit commodo officia consectetur. Ut minim dolor **incididunt aliqua. Adipisicing** amet dolor esse nostrud dolore ex adipisicing. Dolor fugiat dolor adipisicing irure nostrud. Amet laboris enim exercitation consectetur aliquip voluptate.\nAdipisicing proident quis minim do Lorem ut. Ea sit ex tempor sit enim laboris cillum elit veniam exercitation pariatur. Reprehenderit quis in dolore minim excepteur eu nisi ex et reprehenderit sit duis duis commodo. Enim quis incididunt laboris incididunt enim aliqua sunt exercitation **anim deserunt aliquip** irure. Do laboris culpa esse eu proident consectetur.",
  "Officia dolor nisi laboris deserunt et do ut. Enim pariatur consectetur ad magna nisi ut. Culpa ex aliquip commodo ullamco do. Reprehenderit cupidatat sit *cupidatat qui magna et* aliquip sit adipisicing velit aliqua Lorem.*\nAd labore aliquip aliquip ullamco voluptate. Occaecat ipsum mollit ex sint aliquip ut eu sint. Occaecat reprehenderit enim duis duis quis duis id. Pariatur ad esse amet id occaecat. Labore cillum cillum dolore ad.*\nOccaecat qui dolore enim culpa amet ex aliqua. Aliquip laborum est excepteur reprehenderit duis laborum cupidatat aliqua est ut adipisicing. Enim ipsum sint pariatur **laborum** exercitation. Sit voluptate veniam Lorem aliqua ut ad. Dolor deserunt ut sunt excepteur exercitation Lorem eu et sunt.\nDo minim do magna commodo veniam excepteur qui. Labore quis officia ea exercitation** nisi ea nulla cillum adipisicing** exercitation Lorem aliquip. Est minim qui tempor laborum anim irure quis quis elit duis in incididunt occaecat. Ad consectetur proident proident nostrud qui esse mollit *deserunt in duis tempor eiusmod. Anim laboris ad occaecat eiusmod. Nostrud adipisicing* Lorem ad cupidatat irure aliquip sint minim minim laboris exercitation aliqua consequat esse. Irure ea anim irure occaecat sit.",
  "Dolore **excepteur** labore id do mollit enim consectetur elit occaecat ex dolore proident consectetur aute.",
  "Ex deserunt ipsum do velit consequat exercitation culpa commodo."
];

// Images
const testImages = [
  "https://cdn.pixabay.com/photo/2019/12/12/13/42/castle-4690710__340.jpg",
  "https://cdn.pixabay.com/photo/2019/12/26/05/10/pink-4719682__340.jpg",
  "https://cdn.pixabay.com/photo/2020/02/07/19/05/galaxy-4828098__340.jpg",
  "https://cdn.pixabay.com/photo/2020/02/06/15/31/tiger-4824663__340.png",
  "https://cdn.pixabay.com/photo/2020/01/20/05/54/one-4779562__340.jpg",
  "https://cdn.pixabay.com/photo/2019/12/06/14/01/sea-4677421__340.jpg",
  "https://cdn.pixabay.com/photo/2019/07/30/17/38/koala-4373467__340.jpg",
  "https://cdn.pixabay.com/photo/2020/03/01/19/28/heart-4893891__340.png",
  "https://cdn.pixabay.com/photo/2020/02/29/17/14/wallpaper-4890663__340.jpg",
  "https://cdn.pixabay.com/photo/2020/03/02/04/52/people-4894818__340.png",
  "https://cdn.pixabay.com/photo/2020/02/26/23/25/ancient-4882999__340.jpg"
];

// Locations
const testLocations: Location[] = [
  {
    name: "Cremallera de Montserrat",
    type: "Point",
    coordinates: [41.5922793, 1.8342942]
  },
  {
    name: "Torre Eiffel",
    type: "Point",
    coordinates: [48.8583736, 2.2922873]
  },
  {
    name: "Les Olives",
    type: "Point",
    coordinates: [42.1050622, 3.0157955]
  },
  {
    name: "Playa de La Concha",
    type: "Point",
    coordinates: [43.3178579, -1.9882534]
  },
  {
    name: "Cremallera de Montserrat",
    type: "Point",
    coordinates: [41.5922793, 1.8342942]
  }
];

// Contacts
const contacts = [
  {
    type: "phone",
    name: "+34 666 77 88 99"
  },
  {
    type: "email",
    name: "exhange@easterisland.com"
  },
  {
    type: "whatsapp",
    name: "+34 666 66 66 66"
  },
  {
    type: "telegram",
    name: "@telegramUser"
  }
];

function mockGroupSummary(index: number): GroupSummary {
  const code = "GRP" + index;
  return {
    id: uid(),
    type: "groups",
    attributes: {
      code: code,
      name: lorem.generateWords(Math.round(Math.random() * 2) + 1),
      description: testDescriptions[index % testDescriptions.length],
      image: testImages[index % testImages.length],
      website: "https://easterislandgroup.org",
      access: "public",
      location: testLocations[index % testLocations.length]
    },
    links: {
      self: BASE_URL + "/groups/" + code
    }
  };
}

function mockContacts(code: string): Contact[] {
  return Array.from(contacts, contact => {
    const id: string = uid();
    return {
      type: "contacts",
      id: id,
      attributes: {
        ...contact,
        created: new Date().toJSON(),
        updated: new Date().toJSON()
      },
      links: {
        self: BASE_URL + "/" + code + "/contacts" + id
      }
    };
  });
}

function resourceIdentifiers(
  resources: ResourceObject[]
): ResourceIdentifierObject[] {
  return Array.from(resources, resource => {
    return {
      id: resource.id,
      type: resource.type
    };
  });
}

/**
 * Mock Address.
 * @param index Index.
 */
function mockAddress(index: number): Address {
  return {
    streetAddress: index + " S. Broadway",
    addressLocality: "Denver",
    postalCode: "80209",
    addressRegion: "CO"
  };
}

function relatedCollection(path: string, count: number): RelatedCollection {
  return {
    links: {
      related: BASE_URL + path
    },
    meta: {
      count
    }
  };
}

/**
 * Mock result for GET /groups/
 *
 * https://app.swaggerhub.com/apis/estevebadia/komunitin-api/0.0.1#/Groups/get_groups
 */
export function mockGroupList(): CollectionResponse<GroupSummary> {
  const list = [] as GroupSummary[];

  for (let index = 1; index < NUM_GROUPS; index++) {
    list.push(mockGroupSummary(index));
  }

  return {
    data: list,
    links: {
      self: BASE_URL + "/groups",
      first: BASE_URL + "/groups",
      prev: null,
      next: null
    },
    meta: {
      count: NUM_GROUPS
    }
  };
}
/**
 * @todo
 ResourceResponseInclude2<T extends ResourceObject, I extends
ResourceObject, J Extends ResourceObject> extends ResourceResponse<T> {
  included: (I|J)[]
}
y por otro lado que la función de SocialApi separe por tipos y devuelva:

{group: Group, contacts: Contact[], categories: Category[] }

 */
/**
 * Mock result for /{groupCode}
 *
 * https://app.swaggerhub.com/apis/estevebadia/komunitin-api/0.0.1#/Groups/get__groupCode_
 */
export function mockGroup(): ResourceResponseInclude<Group, Contact> {
  const summary = mockGroupSummary(1);
  const code = summary.attributes.code;
  const contacts = mockContacts(code);

  const group: Group = {
    ...summary,
    attributes: {
      ...summary.attributes,
      created: new Date().toJSON(),
      updated: new Date().toJSON()
    },
    relationships: {
      contacts: {
        data: resourceIdentifiers(contacts)
      },
      members: relatedCollection(`/${code}/members`, 123),
      categories: relatedCollection(`/${code}/categories`, 11),
      offers: relatedCollection(`/${code}/offers`, 222),
      needs: relatedCollection(`/${code}/needs`, 12),
      posts: relatedCollection(`/${code}/posts`, 34)
    }
  };

  return {
    data: group,
    included: contacts
  };
}

/**
 * Mock category summary.
 */
function mockCategorySummary(index: number): CategorySummary {
  const id = uid();
  return {
    id: id,
    type: "categories",
    attributes: {
      code: lorem.generateWords(1),
      name: lorem.generateWords(Math.round(Math.random() * 2) + 1),
      cpa: ["10", "11", "56"],
      description: lorem.generateParagraphs(Math.round(Math.random() * 4) + 1),
      icon: testImages[index % testImages.length],
      access: "public",
      created: new Date().toJSON(),
      updated: new Date().toJSON()
    },

    links: {
      self: BASE_URL + "/categories/" + id
    }
  };
}

/**
 * Mock result for /{groupCode}/categories/id
 */
export function mockCategory(index: number): Category {
  const summary = mockCategorySummary(index);

  return {
    ...summary,
    relationships: {
      group: {
        links: {
          related: BASE_URL + "/group/EITE"
        }
      },
      needs: {
        links: {
          related: BASE_URL + "/group/EITE/needs?filter[category]=food"
        },
        meta: {
          count: Math.round(Math.random() * 100)
        }
      },
      offers: {
        links: {
          related: BASE_URL + "/group/EITE/offers?filter[category]=food"
        },
        meta: {
          count: Math.round(Math.random() * 100)
        }
      }
    }
  };
}
/**
 * Mock result for GET /{groupCode}/categories
 *
 * https://app.swaggerhub.com/apis/estevebadia/komunitin-api/0.0.1#/Groups/get_groups
 */
export function mockCategoryList(code: string): CollectionResponse<Category> {
  const list = [] as Category[];

  for (let index = 1; index <= 4; index++) {
    list.push(mockCategory(index));
  }

  return {
    data: list,
    links: {
      self: BASE_URL + "/" + code + "/categories",
      first: BASE_URL + "/" + code + "/categories",
      prev: null,
      next: null
    },
    meta: {
      count: Math.round(Math.random() * 500)
    }
  };
}

/**
 * Mock member summary.
 */
function mockMemberSummary(index: number): MemberSummary {
  const id = uid();
  return {
    id: id,
    type: "categories",
    attributes: {
      code: lorem.generateWords(1),
      access: "public",
      name: lorem.generateWords(Math.round(Math.random() * 2) + 1),
      type: "business",
      description: lorem.generateParagraphs(Math.round(Math.random() * 4) + 1),
      image: testImages[index % testImages.length],
      address: mockAddress(index),
      location: testLocations[index % testLocations.length],
      created: new Date().toJSON(),
      updated: new Date().toJSON()
    },

    links: {
      self: BASE_URL + "/merbers/" + id
    }
  };
}

/**
 * Mock result for /{groupCode}/categories/id
 */
export function mockMember(index: number): Member {
  const summary = mockMemberSummary(index);

  return {
    ...summary,
    relationships: {
      contacts: {
        data: [
          { type: "contacts", id: "7ceb75eb-9da0-4746-bb61-a34e0be49112" },
          { type: "contacts", id: "193e98b4-a27d-4e8a-9a47-2dc5cd1c1ffb" }
        ]
      },
      group: {
        links: {
          related: BASE_URL + "/group/EITE"
        }
      },
      needs: {
        links: {
          related: BASE_URL + "/group/EITE/needs?filter[member]=food"
        },
        meta: {
          count: Math.round(Math.random() * 100)
        }
      },
      offers: {
        links: {
          related: BASE_URL + "/group/EITE/offers?filter[member]=food"
        },
        meta: {
          count: Math.round(Math.random() * 100)
        }
      }
    }
  };
}
/**
 * Mock result for GET /{groupCode}/categories
 *
 * https://app.swaggerhub.com/apis/estevebadia/komunitin-api/0.0.1#/Groups/get_groups
 */
export function mockMemberList(code: string): CollectionResponse<Member> {
  const list = [] as Member[];

  for (let index = 1; index <= 4; index++) {
    list.push(mockMember(index));
  }

  return {
    data: list,
    links: {
      self: BASE_URL + "/" + code + "/categories",
      first: BASE_URL + "/" + code + "/categories",
      prev: null,
      next: null
    },
    meta: {
      count: Math.round(Math.random() * 500)
    }
  };
}

/**
 * Mock currency status.
 *
 * '7.201 transaccions / any',
 * '89.500 intercanviats / any',
 * '6.500 en circulació',
 * '1 ECO = 1 EÇ = 0,1 ℏ = 1 tk'
 */
export function mockCurrency(code: string) {
  return {
    symbol: "EÇ",
    name: "Eco" + code,
    value: 0.1,
    scale: 2,
    transaccions: Math.round(Math.random() * 10000),
    exchanges: Math.round(Math.random() * 10000),
    circulation: Math.round(Math.random() * 10000)
  };
}
