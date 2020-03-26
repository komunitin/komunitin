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

export interface RelatedCollection {
  links: {
    related: string;
  };
  meta: {
    count: number;
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
 * Categories.
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
