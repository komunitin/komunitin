/**
 * Modelo para Exchange.
 *
 * @todo Gestión de localizaciones.
 */
export interface GroupsListModel {
  id: number;
  name: string;
  description: string;
  accounts: number;
  logo: string;
  code: string;
  attributes: {};
}

/**
 * Modelo para ExchangesList
 *
 * @todo Gestión de localizaciones.
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
      access: string;
      location: {
        name: string;
        type: string;
        bbox: number[];
        coordinates: [number, number][][];
      };
    };
    relatinships: {
      contacts: {
        data: object[];
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
  included: object | null;
}
