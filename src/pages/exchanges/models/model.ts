/**
 * Modelo para Exchange.
 *
 * @todo Gestión de localizaciones.
 */
export interface ExchangesListModel {
  id: number;
  name: string;
  description: string;
  accounts: number;
  location: string;
  logo: string;
  code: string;
}

/**
 * Modelo para ExchangesList
 *
 * @todo Gestión de localizaciones.
 */
export interface ExchangeModel {
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
