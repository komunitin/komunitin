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
  CategorySummary,
  Category,
  ResourceResponse
} from "./model";
import { LoremIpsum, ILoremIpsumParams } from "lorem-ipsum";
import { uid } from "quasar";
import KOptions from "../../../komunitin.json";

// Configuration
const BASE_URL = KOptions.apis.social;
const NUM_GROUPS = 11;
const NUM_CATEGORIES = 20;

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
      description: lorem.generateParagraphs(Math.round(Math.random() * 4) + 1),
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

function mockCategorySummary(index: number): Category {
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
    relationships: {
      group: {
        links: {
          related: "https://komunitin.org/EITE"
        }
      },
      needs: {
        links: {
          related: "https://komunitin.org/EITE/needs?filter[category]=food"
        },
        meta: {
          count: 3
        }
      },
      offers: {
        links: {
          related: "https://komunitin.org/EITE/offers?filter[category]=food"
        },
        meta: {
          count: 32
        }
      }
    },
    links: {
      self: BASE_URL + "/categories/" + id
    }
  };
}
/**
 * Mock result for GET /{groupCode}/categories
 *
 * https://app.swaggerhub.com/apis/estevebadia/komunitin-api/0.0.1#/Groups/get_groups
 */
export function mockCategoryList(): CollectionResponse<CategorySummary> {
  const list = [] as CategorySummary[];

  for (let index = 1; index < NUM_CATEGORIES; index++) {
    list.push(mockCategorySummary(index));
  }

  return {
    data: list,
    links: {
      self: BASE_URL + "/categories",
      first: BASE_URL + "/categories",
      prev: null,
      next: null
    },
    meta: {
      count: Math.round(Math.random() * 500)
    }
  };
}
/**
 * Mock result for /{groupCode}/categories/id
 */
export function mockCategory(): ResourceResponse<Category> {
  const summary = mockCategorySummary(1);

  const category: Category = {
    ...summary,
    relationships: {
      group: {
        links: {
          related: "https://komunitin.org/EITE"
        }
      },
      offers: {
        links: {
          related: "https://komunitin.org/EITE/offers?filter[category]=food"
        },
        meta: {
          count: 32
        }
      },
      needs: {
        links: {
          related: "https://komunitin.org/EITE/needs?filter[category]=food"
        },
        meta: {
          count: 2
        }
      }
    }
  };

  return {
    data: category
  };
}
