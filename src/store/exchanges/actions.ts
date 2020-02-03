// import axios from 'axios';
import { IExchange } from './model';
import { mockExchanges } from './mockData';

export function getAllExchanges ( {commit}) {

    // @todo llamada a la API o devolvemos Mock dependiendo de la configuración.
    commit('collectExchanges', mockExchanges);

}