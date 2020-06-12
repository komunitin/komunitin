// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Factory, Server, ModelInstance, belongsTo, hasMany } from "miragejs";
import faker from "faker";
import KOptions from "../komunitin.json";
import ApiSerializer from "./ApiSerializer";
import { filter, sort, search } from "./ServerUtils";

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
    }),
    transaction: ApiSerializer.extend({
      selfLink: (transaction: any) => `${urlAccounting}/${transaction.currency.code}/transactions/${transaction.id}`,
      shouldIncludeLinkageData(relationshipKey: string, model: any) {
        return (
          ApiSerializer.prototype.shouldIncludeLinkageData.apply(this, [
            relationshipKey,
            model
          ]) || relationshipKey == "transfers"
        );
      },
    }),
    transfer: ApiSerializer
  },
  models: {
    currency: Model,
    account: Model.extend({
      currency: belongsTo(),
      transactions: hasMany(),
    }),
    transaction: Model.extend({
      currency: belongsTo(),
      transfers: hasMany(),
    }),
    transfer: Model.extend({
      payer: belongsTo("account"),
      payee: belongsTo("account"),
    })
  },
  factories: {
    currency: Factory.extend({
      codeType: "CEN",
      code: (i: number) => `CUR${i}`,
      name: () => faker.hacker.noun(),
      namePlural: () => faker.hacker.noun() + "s",
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
      balance: () => faker.random.number({ max: 10000000, min: -5000000, precision: 100 }),
      creditLimit: -1,
      debitLimit: 5000000
    }),
    transaction: Factory.extend({
      state: (i: number) => (i < 3 ? "pending" : (i % 8 == 0) ? "rejected" : "committed"),
      created: (i: number) => faker.date.recent(i % 5).toJSON(),
      updated() {
        return this.created;
      },
      expires() {
        return (this as any).state == "pending" ? faker.date.future().toJSON() : undefined;
      }
    }),
    transfer: Factory.extend({
      amount: () => faker.random.number({min: 0.1*10000, max: 100*10000, precision: 100}),
      meta: () => faker.company.catchPhrase(),
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
        group.update({ currency });
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
          member.update({ account });
        }
      );

    // Generate 50 transactions between the first account and the following 5 accounts.
    const accounts = server.schema.accounts.all();
    const account = accounts.models[0];
    const currency = account.currency;
    for (let i = 1; i < 6; i++) {
      const other = accounts.models[i];
      const payments = server.createList("transfer", 5, {
        payer: account,
        payee: other
      });
      payments.forEach((transfer: ModelInstance) => server.create("transaction", {
        transfers: [transfer],
        currency
      }));
      const charges = server.createList("transfer", 5, {
        payer: other,
        payee: account
      });
      charges.forEach((transfer: ModelInstance) => server.create("transaction", {
        transfers: [transfer],
        currency
      }));
    }
  },
  routes(server: Server) {
    // Single currency
    server.get(urlAccounting + "/:code/currency", (schema: any, request) => {
      return schema.currencies.findBy({ code: request.params.code });
    });
    // Accounts list
    server.get(urlAccounting + "/:code/accounts", (schema: any, request) => {
      const currency = schema.currencies.findBy({ code: request.params.code });
      return filter(schema.accounts.where({ currencyId: currency.id }), request);
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
    // Account transactions.
    server.get(`${urlAccounting}/:currency/transactions`,
      (schema: any, request) => {
        if (request.queryParams["filter[account]"]) {
          // Custom filtering.
          const accountId = request.queryParams["filter[account]"];
          let transfers = schema.transfers.where((transfer: any) => transfer.payerId == accountId || transfer.payeeId == accountId);
          // Apply search to transfer objects instead of transaction objects.
          transfers = search(transfers, request);

          const ids = transfers.models.map((model: any) => model.id);
          let result = schema.transactions.where((transaction: any) => ids.includes(transaction.transferIds[0]));
          result = sort(result, request);
          return result;
        } else {
          throw new Error("Unexpected request!");
        }
      }
    );
  }
};
