/**
 * See https://jsonapi.org/format/#document-resource-identifier-objects
 */
export interface ResourceIdentifierObject {
  type: string;
  id: string;
}

export interface ResourceObject extends ResourceIdentifierObject {
  links: {
    self: string;
  };
}

export interface ErrorObject {
  status: number;
  code: string;
  title: string;
}

export type Response<T extends ResourceObject, I extends ResourceObject> =
  | ErrorResponse
  | ResourceResponse<T>
  | ResourceResponseInclude<T, I>
  | CollectionResponse<T>;

export interface ErrorResponse {
  errors: ErrorObject[];
}

export interface ResourceResponse<T extends ResourceObject> {
  data: T | null;
}

export interface ResourceResponseInclude<
  T extends ResourceObject,
  I extends ResourceObject
> {
  data: T | null;
  included: I[];
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

export interface RelatedCollection {
  links: {
    related: string;
  };
  meta: {
    count: number;
  };
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
 * Group summarized model for cards.
 */
export interface GroupSummary extends ResourceObject {
  attributes: {
    code: string;
    name: string;
    description: string;
    image: string;
    website: string;
    access: Access;
    location: Location;
  };
  meta: {
    // Category Members.
    categoryMembers?: [string, number][];
  };
}

/**
 * Full group model.
 */
export interface Group extends GroupSummary {
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
    contacts: {
      data: ResourceIdentifierObject[];
    };
    members: RelatedCollection;
    categories: RelatedCollection;
    offers: RelatedCollection;
    needs: RelatedCollection;
    posts: RelatedCollection;
  };
}

/**
 * Categories summary.
 */
export interface CategorySummary extends ResourceObject {
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
}
/**
 * Category interface.
 */

export interface Category extends CategorySummary {
  relationships: {
    group: {
      links: {
        related: string;
      };
    };
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
 * Member summary.
 */
export interface MemberSummary extends ResourceObject {
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
}
/**
 * Member interface.
 */
export interface Member extends MemberSummary {
  relationships: {
    contacts: {
      data: ResourceIdentifierObject[];
    };
    group: {
      links: {
        related: string;
      };
    };
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
      transaccions: number;
      exchanges: number;
      circulation: number;
    };
  };
}

/**
 * Offer summarized model for cards.
 */
export interface OfferSummary extends ResourceObject {
  attributes: {
    name: string;
    // Some markdown.
    content: string;
    images: ImageObject[];
    access: Access;
    expires: string;
    created: string;
    updated: string;
  };
}

/**
 * Full offer model.
 */
export interface Offer extends OfferSummary {
  relationships: {
    category: {
      links: {
        related: string;
      };
    };
    author: {
      links: {
        related: string;
      };
    };
  };
  include: Member;
}
