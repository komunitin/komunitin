import { ExchangeModel } from './model';

export function collectExchanges(state: any, exchanges: ExchangeModel) {
  state.exchanges = exchanges;
}

export function getExchange(state: any, exchange: ExchangeModel) {
  console.log({ 'MUTATIONS:': exchange });
  state.exchange = exchange;
}
