// import axios from 'axios';
import { IExchange } from './model';
import { mockExchange } from './mockData';

export function getAllExchanges({ commit }: any) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  commit('collectExchanges', mockExchange);
}

export function getExchange({ commit }: any, id: Number) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  commit('getExchange', mockExchange[id]);
}
