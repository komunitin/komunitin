// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Factory, Server, ModelInstance, belongsTo } from "miragejs";
import faker from "faker";
import KOptions from "../komunitin.json";
import ApiSerializer from "./ApiSerializer";

const urlAccounting = KOptions.apis.accounting;

export default {
  serializers: {
    currency: ApiSerializer.extend({
      selfLink: (model: { code: string }) =>
        urlAccounting + "/" + model.code + "/currency"
    }),
    account: ApiSerializer.extend({
      selfLink: (account: any) =>
        urlAccounting +
        "/" +
        account.currency.code +
        "/accounts/" +
        account.code
    })
  },
  models: {
    currency: Model,
    account: Model.extend({
      currency: belongsTo()
    })
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
        transactions: Math.round(Math.random() * 10000),
        exchanges: Math.round(Math.random() * 10000),
        circulation: Math.round(Math.random() * 10000)
      }
    }),
    account: Factory.extend({
      code: (i: number) => `account-${i}`,
      balance: faker.random.number({ max: 1000, min: -500, precision: 10 }),
      creditLimit: -1,
      debitLimit: 500
    })
  },
  /**
   * Needs to be called after SocialServer.seeds.
   * @param server
   */
  seeds(server: any) {
    faker.seed(2029);
    // Create a currency for each group
    server.schema.groups
      .all()
      .models.forEach((group: ModelInstance<Record<string, any>>) => {
        const currency = server.create("currency", { code: group.code });
        group.update({
          currency: {
            links: {
              related: `${urlAccounting}/${group.code}/currency`
            },
            data: { type: "currencies", id: currency.id }
          }
        });
      });
    // Create an account for each member
    server.schema.members
      .all()
      .models.forEach(
        (member: ModelInstance<Record<string, any>>, i: number) => {
          const code = member.group.code;
          const accountCode = code + `${i}`.padStart(4, "0");
          const account = server.create("account", {
            code: accountCode,
            currency: server.schema.currencies.findBy({ code })
          });
          member.update({
            account: {
              links: {
                related: `${urlAccounting}/${code}/accounts/${accountCode}`
              },
              data: { type: "accounts", id: account.id }
            }
          });
        }
      );
  },
  routes(server: Server) {
    // Single currency
    server.get(urlAccounting + "/:code/currency", (schema: any, request) => {
      return schema.currencies.findBy({ code: request.params.code });
    });
    // Single account
    server.get(
      urlAccounting + "/:currency/accounts/:code",
      (schema: any, request) => {
        const currency = schema.currencies.findBy({
          code: request.params.currency
        });
        return schema.accounts.findBy({
          code: request.params.code,
          currencyId: currency.id
        });
      }
    );
  }
};
