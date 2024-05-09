
import { InputCurrency, Currency } from "../model/currency";
export { createController } from "./controller";
/**
 * Controller for operations not related to a particular currency.
 */
export interface SharedController {
  createCurrency(currency: InputCurrency): Promise<Currency>
  getCurrencies(): Promise<Currency[]>
  getCurrency(code: string): Promise<Currency | undefined>
}
