

/**
 * See https://jsonapi.org/format/#document-resource-identifier-objects
 */
export interface ResourceIdentifierObject {
  type: string;
  id: string;
}
export type Relationship = RelatedResource | RelatedLinkedCollection | RelatedCollection;
export interface ResourceObject extends ResourceIdentifierObject {
  links: {
    self: string;
  };
  relationships? : {
    [key: string]: Relationship;
  }
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
    type: string;
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
    "code-type": string;
    code: string;
    name: string;
    "name-plural": string;
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
