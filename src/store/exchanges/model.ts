/**
 * Modelo para Exchanges.
 *
 * @todo Gestión de localizaciones.
 */
export interface IExchange {
  id: number;
  name: string;
  description: string;
  accounts: number;
  location: string;
  logo: string;
  code: string;
}
