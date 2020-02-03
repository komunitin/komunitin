export interface IExchange {
    id: number;
    name: string;
    description: string;
    accounts: number;
    /**
     * @todo Gestión de localizaciones.
     */
    location: string;
    logo: string;
  };