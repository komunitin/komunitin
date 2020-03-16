import { Server } from 'miragejs';
import { mockGroup, mockGroupsList } from '../pages/groups/models/mockData';

console.debug('Mirage activated');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const server = new Server({
  timing: 500,
  logging: true,
  // urlPrefix: 'https://integralces.net/api',
  // namespace: 'groups',

  routes() {
    if (process.env.USE_MIRAGE) {
      this.timing = parseInt(process.env.USE_MIRAGE);
    }
    /**
     * List of groups.
     */
    this.get(
      'https://integralces.net/api/groups/:pag/:perPag',
      (schema, request) => {
        const pag = request.params.pag;
        const perPag = request.params.perPag;
        console.debug({ ListGroupsGet: { pag: pag, perPag: perPag } });
        return mockGroupsList();
      }
    );

    /**
     * List of groups width location.
     */
    this.get(
      'https://integralces.net/api/groups/:pag/:perPag/:lat/:lng',
      (schema, request) => {
        const lat = request.params.lat;
        const lng = request.params.lng;
        const pag = request.params.pag;
        const perPag = request.params.perPag;

        console.debug({ Mirage: [pag, perPag, lat, lng] });

        return mockGroupsList();
      }
    );

    /**
     * List of groups width filter.
     */
    this.get(
      'https://integralces.net/api/groups/filter/:search',
      (schema, request) => {
        const search = request.params.search;
        console.debug({ Search: search });
        return mockGroupsList();
      }
    );

    /**
     * Group.
     */
    this.get('https://integralces.net/api/group/:id', (schema, request) => {
      let id = request.params.id;
      id = 0;
      return mockGroup[id];
    });
  }
});
