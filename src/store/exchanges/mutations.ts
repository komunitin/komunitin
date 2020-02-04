import { IExchange } from './model';

export function collectExchanges(state: any, exchanges: IExchange) {
  state.exchanges = exchanges;
}

export function getExchange(state: any, exchange: IExchange) {
  state.exchange = exchange;
}
