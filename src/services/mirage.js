import { Server } from 'miragejs';
import { mockGroup, mockGroupsList } from '../pages/exchanges/models/mockData';

console.log('Mirage activated');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const server = new Server({
  timing: 500,
  logging: true,
  // urlPrefix: 'https://integralces.net/api',
  // namespace: 'exchanges',

  routes() {
    if (process.env.USE_MIRAGE) {
      this.timing = parseInt(process.env.USE_MIRAGE);
    }
    /**
     * List of exchanges.
     */
    this.get(
      'https://integralces.net/api/exchanges/:pag/:perPag',
      (schema, request) => {
        let pag = request.params.pag;
        let perPag = request.params.perPag;

        // @dev
        console.log({
          Mirage: { pag: pag, perPag: perPag }
        });
        return mockGroupsList;
      }
    );

    /**
     * List of exchanges width location.
     */
    this.get(
      'https://integralces.net/api/exchanges/:pag/:perPag/:lat/:lng',
      (schema, request) => {
        let lat = request.params.lat;
        let lng = request.params.lng;
        let pag = request.params.pag;
        let perPag = request.params.perPag;

        // @dev
        console.debug({
          Mirage: {
            class: this,
            timing: this.timing,
            pag: pag,
            perPag: perPag,
            lat: lat,
            lng: lng
          }
        });
        return mockGroupsList;
      }
    );

    /**
     * List of exchanges width filter.
     */
    this.get(
      'https://integralces.net/api/exchanges/filter/:search',
      (schema, request) => {
        let search = request.params.search;
        // @dev
        console.log({
          Mirage: { search: search }
        });
        return mockGroupsList;
      }
    );

    /**
     * Exchange.
     */
    this.get('https://integralces.net/api/exchange/:id', (schema, request) => {
      let id = request.params.id;
      id = 0;
      return mockGroup[id];
    });
  }
});
