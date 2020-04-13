import {
  GroupSummary,
  Group,
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
  Address,
  Currency,
  ResourceResponse,
  OfferSummary,
  Offer
} from "../model";
import { LoremIpsum, ILoremIpsumParams } from "lorem-ipsum";
import { uid } from "quasar";
import KOptions from "../../../../komunitin.json";
import { testDescriptions } from "./testDescriptions";
import { testImages } from "./testImages";
import { testLocations } from "./testLocations";
import { testContacts } from "./testContacts";

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

function mockContacts(code: string): Contact[] {
  return Array.from(testContacts, contact => {
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
 * Mock group summary.
 *
 * @param code Code of group.
 */
function mockGroupSummary(code: string): GroupSummary {
  const index = parseInt(code.substr(3));

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
    },
    meta: {
      categoryMembers: [
        ["business", 13],
        ["organitzacions", 8],
        ["personals", 40],
        ["publics", 4]
      ]
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
    const code = "GRP" + index;
    list.push(mockGroupSummary(code));
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
export function mockGroup(
  code: string
): ResourceResponseInclude<Group, Contact> {
  const summary = mockGroupSummary(code);
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
  const code = lorem.generateWords(1);
  return {
    id: id,
    type: "member",
    attributes: {
      code: code,
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
      self: BASE_URL + "/" + code + "/merbers/" + id
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
          related: BASE_URL + "/EITE"
        }
      },
      needs: {
        links: {
          related: BASE_URL + "/EITE/needs?filter[member]=food"
        },
        meta: {
          count: Math.round(Math.random() * 100)
        }
      },
      offers: {
        links: {
          related: BASE_URL + "/EITE/offers?filter[member]=food"
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
 * {

}
 */
export function mockCurrency(code: string): ResourceResponse<Currency> {
  return {
    data: {
      type: "currencies",
      id: "XXXX",
      links: {
        self: BASE_URL + "/" + code + "/currency"
      },
      attributes: {
        "code-type": "CEN",
        code: "WDLD",
        name: "Eco" + code,
        "name-plural": "Eco" + code + "s",
        symbol: "EÇ",
        decimals: 2,
        value: 100000,
        scale: 4,
        stats: {
          transaccions: Math.round(Math.random() * 10000),
          exchanges: Math.round(Math.random() * 10000),
          circulation: Math.round(Math.random() * 10000)
        }
      }
    }
  };
}

/**
 * Mock offer summary.
 *
 * @param index Index.
 */
function mockOfferSummary(index: number): OfferSummary {
  const code = "GRP" + index;

  return {
    id: uid(),
    type: "offers",
    links: {
      self: BASE_URL + code + "/" + "/offers"
    },
    attributes: {
      name: "Ecologic Bread",
      content:
        "Culpa aliqua **nostrud dolor minim** nisi et occaecat exercitation do ea *veniam* duis eu. Et ullamco exercitation anim ut id dolore ad ad nostrud proident amet. Culpa quis labore ex non minim duis eiusmod ea tempor eu amet elit excepteur.\nCupidatat exercitation enim voluptate id irure sint officia fugiat id mollit nisi. Ipsum dolore dolore et enim veniam consectetur nulla duis est quis. Ex in ea sit deserunt exercitation et laborum anim id.\nIrure ullamco consequat ad eiusmod incididunt ad velit amet. Anim dolore ut aliqua officia ad velit anim enim ex quis qui. Incididunt id minim minim ex cillum pariatur amet sit laboris deserunt aliquip adipisicing elit. Est magna quis nostrud sit mollit dolore consectetur quis consectetur occaecat cupidatat magna irure.", // Some markdown.
      images: [
        {
          href: testImages[index],
          alt: "Ecologic Bread image"
        },
        {
          href: testImages[0],
          alt: "Ecologic Bread image"
        },
        {
          href: testImages[1],
          alt: "Ecologic Bread image"
        }
      ],
      access: "public",
      expires: new Date().toJSON(),
      created: new Date().toJSON(),
      updated: new Date().toJSON()
    }
  };
}
/**
 * Mock result for /{groupCode}/offers/{id}
 */
export function mockOffer(): ResourceResponseInclude<Offer, Member> {
  const summary = mockOfferSummary(1);
  const member = mockMember(1);

  const offer: Offer = {
    ...summary,
    relationships: {
      category: {
        links: {
          relared: "https://komunitin.org/EITE/categories/food"
        }
      },
      author: {
        links: {
          related: "https://komunitin.org/EITE/EITE0005"
        }
      }
    }
  };

  return {
    data: offer,
    included: [member]
  };
}

/**
 * Mock result for GET /{groupCode}/offers/
 */
export function mockOfferList(): CollectionResponse<OfferSummary> {
  const list = [] as OfferSummary[];

  for (let index = 1; index < NUM_GROUPS; index++) {
    list.push(mockOfferSummary(index));
  }

  return {
    data: list,
    links: {
      self: BASE_URL + "/offers",
      first: BASE_URL + "/offers",
      prev: null,
      next: null
    },
    meta: {
      count: Math.round(Math.random() * 1500)
    }
  };
}
