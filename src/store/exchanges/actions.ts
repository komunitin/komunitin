// import axios from 'axios';
import { IExchange } from './model';
import { mockExchanges } from './mockData';

export function getAllExchanges ( {commit}) {

    console.log(mockExchanges);
    commit('collectExchanges', mockExchanges);

}