import { Server } from 'miragejs';
import { mockExchange, mockExchangesList } from '../store/exchanges/mockData';

console.log('Mirage activated');

const server = new Server({
  timing: 1000,
  logging: true,
  // urlPrefix: 'https://integralces.net/api',
  routes() {
    /**
     * List of exchanges.
     */
    this.get('https://integralces.net/api/exchages/0/20', mockExchangesList);

    /**
     * Exchange.
     */
    this.get('https://integralces.net/api/exchange/1', (schema, request) => {
      // let id = request.params.id;
      console.log(mockExchange);
      return mockExchange[0].data;
    });
  }
});
