/**
 * Modelo para Exchange.
 *
 * @todo Gestión de localizaciones.
 */
export interface ExchangeModel {
  id: number;
  name: string;
  description: string;
  accounts: number;
  location: string;
  logo: string;
  code: string;
}
