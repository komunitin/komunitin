import axios from 'axios';

const apliClient = axios.create({
  baseURL: 'https://integralces.net/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'cache-control': 'no-cache',
    Authorization: 'Bearer ' + 'token',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
  }
});

export default {
  getGroupsListFilter(filter: string) {
    return apliClient.get('/groups/filter/' + filter);
  },
  getGroupsList(
    pag: number,
    perPag: number,
    lat?: number | null,
    lng?: number | null
  ) {
    let url = 'groups/' + pag + '/' + perPag;
    if (lat) {
      url = url + '/' + lat + '/' + lng;
    }
    return apliClient.get(url);
  },
  getGroup(id: string) {
    return apliClient.get('/group/' + id);
  }
};
