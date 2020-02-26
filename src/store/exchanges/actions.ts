import api from '../../services/ICESApi';

export function clearLastError({ commit }: any) {
  commit('setLastError', false);
}

export function getAllExchanges({ commit }: any) {
  api
    .getExchangesList()
    .then(response => {
      commit('collectExchanges', response.data);
    })
    .catch(function(error) {
      commit('setLastError', error);
      // throw error;
    });
}

export function getExchange({ commit }: any, id: string) {
  api
    .getExchange(id)
    .then(response => {
      commit('getExchange', response.data);
    })
    .catch(function(error) {
      commit('setLastError', error);
      // throw error;
    });
}
