

/**
 * See https://jsonapi.org/format/#document-resource-identifier-objects
 */
export interface ResourceIdentifierObject {
  type: string;
  id: string;
}
export type Relationship = RelatedResource | RelatedLinkedCollection | RelatedCollection ;
export interface ResourceObject extends ResourceIdentifierObject {
  links: {
    self: string;
  };
  attributes?: Record<string, unknown>
  relationships?: Record<string, Relationship>
}

export interface ErrorObject {
  status: number;
  code: string;
  title: string;
}

export type Response<T extends ResourceObject, I extends ResourceObject> =
  | ErrorResponse
  | ResourceResponse<T>
  | CollectionResponse<T>
  | ResourceResponseInclude<T, I>
  | CollectionResponseInclude<T, I>;

export interface ErrorResponse {
  errors: ErrorObject[];
}

export interface ResourceResponse<T extends ResourceObject> {
  data: T;
}

export interface CollectionResponse<T extends ResourceObject> {
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    count: number;
  };
  data: T[];
}

export interface CollectionResponseInclude<
  T extends ResourceObject,
  I extends ResourceObject
> extends CollectionResponse<T> {
  included: I[];
}

export interface ResourceResponseInclude<
  T extends ResourceObject,
  I extends ResourceObject
> extends ResourceResponse<T> {
  included: I[];
}

/**
 * Geolocation model.
 *
 * Currently it only supports the Point type but it may be extended in
 * the future following the GeoJSON spec.
 */
export interface Location {
  name: string;
  type: "Point";
  coordinates: [number, number];
}

export interface ImageObject {
  href: string;
  alt: string;
}

/**
 * To-many relationship.
 * 
 * Contains the count metadata.
 */
export interface RelatedCollection {
  links: {
    related: string;
  };
  meta: {
    count: number;
  };
  // This is a hack to avoid type issues when dealing
  // with Relationship type and asking the `data` attribute.
  data: undefined;
}

/**
 * Embedded To-many relationship.
 */
export interface RelatedLinkedCollection {
  data: ResourceIdentifierObject[]
}

/**
 * To-one relationship.
 * 
 * Contains linkage to the related resource.
 */
export interface RelatedResource {
  links: {
    related: string;
  },
  data: ResourceIdentifierObject
}

/**
 * Extension Resource Object for the inclusion of external relationships.
 * 
 * Defined in External Relationship custom JSON:API profile:
 * https://github.com/komunitin/komunitin-api/blob/master/jsonapi-profiles/external.md
 */
export interface ExternalResourceObject extends ResourceObject {
  external: true;
  relationships?: undefined;
}

/**
 * User model.
 */
export interface User extends ResourceObject {
  attributes: {
    created: string,
    updated: string,
  },
  relationships: {
    members: RelatedLinkedCollection
  }
}

/**
 * Contact model.
 */
export interface Contact extends ResourceObject {
  attributes: {
    type: string;
    name: string;
    created: string;
    updated: string;
  };
}

export type Access = "public" | "group" | "private";

/**
 * Full group model.
 */
export interface Group extends ResourceObject {
  attributes: {
    code: string;
    name: string;
    description: string;
    image: string;
    website: string;
    access: Access;
    location: Location;
    created: string;
    updated: string;
  };
  relationships: {
    contacts: RelatedLinkedCollection;
    members: RelatedCollection;
    categories: RelatedCollection;
    offers: RelatedCollection;
    needs: RelatedCollection;
    posts: RelatedCollection;
    currency: RelatedResource;
  };
}

/**
 * Category interface.
 */
export interface Category extends ResourceObject {
  attributes: {
    code: string;
    name: string;
    cpa: string[];
    description: string;
    /**
     * The category icon, following the same convention as Quasar framework for icon components:
     * https://quasar.dev/vue-components/icon
     */
    icon: string;
    access: Access;
    created: string;
    updated: string;
  };
  relationships: {
    group: RelatedResource;
    needs: RelatedCollection;
    offers: RelatedCollection;
  };
}

/**
 * Address interface.
 */
export interface Address {
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressRegion: string;
}

/**
 * Member interface.
 */
export interface Member extends ResourceObject {
  attributes: {
    code: string;
    access: Access;
    name: string;
    type: "personal" | "business" | "public";
    description: string;
    image: string;
    address: Address;
    location: Location;
    created: string;
    updated: string;
  };
  relationships: {
    contacts: RelatedLinkedCollection;
    group: RelatedResource;
    needs: RelatedCollection;
    offers: RelatedCollection;
    account: RelatedResource;
  };
}

/**
 * Currency.
 *
 * https://github.com/komunitin/komunitin-api/blob/master/accounting/README.md#currency
 *
 * {
 *   "type": "currencies",
 *   "id": "XXXX",
 *   "attributes": {
 *       "code-type": "CEN",
 *       "code": "WDLD",
 *       "name": "wonder",
 *       "name-plural": "wonders",
 *       "symbol": "₩",
 *       "decimals": 2,
 *       "scale": 4,
 *       "value": 100000,
 *   }
 * }
 */
export interface Currency extends ResourceObject {
  attributes: {
    codeType: string;
    code: string;
    name: string;
    namePlural: string;
    symbol: string;
    decimals: number;
    scale: number;
    value: number;
    stats: {
      transactions: number;
      exchanges: number;
      circulation: number;
    };
  };
}

/**
 * Account model
 * 
 * https://github.com/komunitin/komunitin-api/blob/master/accounting/README.md#account
 */
export interface Account extends ResourceObject {
  attributes: {
    code: string;
    balance: number;
    //locked: 0,
    creditLimit: number;
    debitLimit: number;
    //capabilities: ["pay", "charge"],
  };
  relationships: {
    currency: RelatedResource;
  }
}

export interface Transfer extends ResourceObject {
  attributes: {
    amount: number,
    meta: string,
    state: "new" | "pending" | "accepted" | "committed" | "rejected" | "deleted";
    expires?: string;
    created: string;
    updated: string;
  },
  relationships: {
    payer: RelatedResource,
    payee: RelatedResource,
    currency: RelatedResource,
  }
}

/**
 * Offer model.
 */
export interface Offer extends ResourceObject {
  attributes: {
    name: string;
    content: string;
    images: ImageObject[];
    access: Access;
    expires: string;
    created: string;
    updated: string;
  };
  relationships: {
    category: RelatedResource;
    author: RelatedResource;
  };
}

/**
 * Need model
 */
export interface Need extends ResourceObject {
  attributes: {
    content: string;
    images: ImageObject[];
    access: Access;
    expires: string;
    created: string;
    updated: string;
  };
  relationships: {
    category: RelatedResource;
    author: RelatedResource;
  };
}
