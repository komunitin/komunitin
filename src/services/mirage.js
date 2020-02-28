import { Server } from 'miragejs';
import {
  mockExchange,
  mockExchangesList
} from '../pages/exchanges/models/mockData';

console.log('Mirage activated');

const server = new Server({
  timing: 3000,
  logging: true,
  // urlPrefix: 'https://integralces.net/api',
  // namespace: 'exchanges',

  routes() {
    /**
     * List of exchanges.
     */
    this.get(
      'https://integralces.net/api/exchages/:pag/:perPag/:lat/:lng',
      (schema, request) => {
        let lat = request.params.lat;
        let lng = request.params.lng;
        let pag = request.params.pag;
        let perPag = request.params.perPag;

        // @dev
        console.log({
          Mirage: { pag: pag, perPag: perPag, lat: lat, lng: lng }
        });
        return mockExchangesList;
      }
    );

    /**
     * Exchange.
     */
    this.get('https://integralces.net/api/exchange/:id', (schema, request) => {
      let id = request.params.id;

      // @dev
      console.log({
        Mirage: { id: id }
      });
      console.log(mockExchange);
      return mockExchange[0].data;
    });
  }
});
