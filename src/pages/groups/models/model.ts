/**
 * Groups Model Location.
 */
export interface GroupsListModelLocation {
  name: string;
  type: string;
  coordinates: [number, number];
}
/**
 * Groups Model.
 */
export interface GroupsListModel {
  id: number;
  data: {
    attributes: {
      code: string;
      name: string;
      description: string;
      image: string;
      website: string;
      access: string;
      location: GroupsListModelLocation;
    };
  };
}

/**
 * See https://jsonapi.org/format/#document-resource-identifier-objects
 * 
 */
export interface ResourceIdentifierObject {
  type: string,
  id: string
}

export interface ResourceObject {
  data: ResourceIdentifierObject
}

export type Contact = ResourceObject & {
  data: {
    attributes: {
      type: string,
      name: string,
      created: string,
      updated: string
    }
  }
}

/**
 * Group model.
 */
export interface GroupModel {
  data: {
    id: string;
    type: string;
    attributes: {
      code: string;
      name: string;
      description: string;
      image: string;
      website: string;
      mail: string;
      access: string;
      location: {
        name: string;
        type: string;
        bbox: number[];
        coordinates: [number, number][][];
      };
    };
    relationships: {
      contacts: {
        data: ResourceIdentifierObject[];
      };
      members: {
        links: {
          related: string;
        };
        meta: {
          count: number;
        };
      };
      categories: {
        links: {
          related: string;
        };
        meta: {
          count: number;
        };
      };
      offers: {
        links: {
          related: string;
        };
        meta: {
          count: number;
        };
      };
      needs: {
        links: {
          related: string;
        };
        meta: {
          count: number;
        };
      };
      posts: {
        links: {
          related: string;
        };
        meta: {
          count: number;
        };
      };
    };
    links: {
      self: string;
    };
    meta: {
      created: string;
      updated: string;
    };
  };
  included: object[];
}
