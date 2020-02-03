import { IExchange } from "./model";

export function collectExchanges (state: any, exchanges: IExchange) {
    state.exchanges = exchanges;
}
