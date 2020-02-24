// import axios from 'axios';
// import { mockExchange, mockExchangesList } from './mockData';
import api from '../../services/ICESApi';

export function clearLastError({ commit }: any) {
  commit('setLastError', false);
}

export function getAllExchanges({ commit }: any) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  api
    .getExchangesList()
    .then(response => {
      commit('collectExchanges', response.data);
    })
    .catch(function(error) {
      // console.log({ ERROR: error });
      commit('setLastError', error);
      // throw error;
    });
  // commit('collectExchanges', mockExchangesList);
}

export function getExchange({ commit }: any, id: number) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  api.getExchange(id).then(response => {
    commit('collectExchanges', response.data);
  });
  // commit('getExchange', mockExchange.data);
}
