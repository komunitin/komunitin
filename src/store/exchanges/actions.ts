// import axios from 'axios';
import { mockExchange, mockExchangesList } from './mockData';

export function getAllExchanges({ commit }: any) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  commit('collectExchanges', mockExchangesList);
}

export function getExchange({ commit }: any, id: number) {
  // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
  console.log({ 'ACTION:': mockExchange[0] });
  commit('getExchange', mockExchange[0].data);
}
