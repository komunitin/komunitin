import axios from 'axios';

const apliClient = axios.create({
  baseURL: 'https://integralces.net/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default {
  getExchangesList(pag = 1 as number, perpage = 20 as number) {
    return apliClient.get('exchages/' + perpage * (pag - 1) + '/' + perpage);
  },
  getExchange(id: number) {
    return apliClient.get('/exchange/' + id);
  }
};
