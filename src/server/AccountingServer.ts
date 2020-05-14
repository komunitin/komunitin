// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Factory, Server, ModelInstance } from "miragejs";
import faker from "faker";
import KOptions from "../komunitin.json";
import ApiSerializer from "./ApiSerializer";

const urlAccounting = KOptions.apis.accounting;


export default {
  serializers: {
    currency: ApiSerializer.extend({
      selfLink: (model: { code: string; }) => urlAccounting + "/" + model.code + "/currency"
    })
  },
  models: {
    currency: Model
  },
  factories: {
    currency: Factory.extend({
      "code-type": "CEN",
      code: (i: number) => `CUR${i}`,
      name: () => faker.hacker.noun(),
      "name-plural": () => faker.hacker.noun() + "s",
      symbol: () => faker.finance.currencySymbol(),
      decimals: 2,
      value: 100000,
      scale: 4,
      stats: {
        transaccions: Math.round(Math.random() * 10000),
        exchanges: Math.round(Math.random() * 10000),
        circulation: Math.round(Math.random() * 10000)
      }
    })
  },
  /**
   * Needs to be called after SocialServer.seeds.
   * @param server 
   */
  seeds(server: any) {
    // Create a currency for each group
    server.schema.groups.all().models.forEach((group: ModelInstance<{[key:string]: string}>) => {
      server.create("currency", { code: group.code });
      group.update({currency: urlAccounting + "/" + group.code + "/currency"});
    });
  },
  routes(server: Server) {
    // Single currency
    server.get(urlAccounting + "/:code/currency", (schema: any, request) => {
      return schema.currencies.findBy({code: request.params.code})
    });
  }
};
