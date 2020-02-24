import { Server } from 'miragejs';

console.log('Mirage activated');

const server = new Server({
  timing: 2000,
  logging: true,
  // urlPrefix: 'https://integralces.net/api',
  routes() {
    this.get('https://integralces.net/api/exchages/0/20', () => [
      {
        id: 1,
        title: 'Mocking an API with axios',
        author: 'asantos00',
        createdAt: 1557937282,
        body: 'Lorem ipsum dolor sit amet, consectetur.'
      },
      {
        id: 2,
        title: 'Forget axios interceptors. @miragejs/server',
        author: 'asantos00',
        createdAt: 758851200,
        body: 'Lorem ipsum dolor sit amet, consectetur.'
      }
    ]);
  }
});
