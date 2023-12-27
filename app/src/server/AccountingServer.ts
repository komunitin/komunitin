// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Factory, Server, ModelInstance, Response, belongsTo, hasMany } from "miragejs";
import faker from "faker";
import { KOptions } from "../boot/koptions";
import ApiSerializer from "./ApiSerializer";
import { filter, sort, search } from "./ServerUtils";
import { inflections } from "inflected"



const urlAccounting = KOptions.url.accounting;
inflections("en", function (inflect) {
  inflect.irregular("accountSettings", "accountSettings")
})

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
    accountSettings: ApiSerializer.extend({
      selfLink: (model: any) => urlAccounting + "/" + 
        model.account.currency.code + 
        "/accounts/" + 
        model.account.code + 
        "/settings"
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
    transfer: ApiSerializer,
  },
  models: {
    currency: Model,
    account: Model.extend({
      currency: belongsTo(),
      settings: belongsTo("accountSettings"),
      transfers: hasMany(),
    }),
    transfer: Model.extend({
      payer: belongsTo("account", {inverse: null}),
      payee: belongsTo("account", {inverse: null}),
      currency: belongsTo(),
    }),
    accountSettings: Model.extend({
      account: belongsTo(),
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
    }),
    account: Factory.extend({
      code: (i: number) => `account-${i}`,
      balance: () => faker.random.number({ max: 10000000, min: -5000000, precision: 100 }),
      creditLimit: -1,
      debitLimit: 5000000
    }),
    transfer: Factory.extend({
      amount: () => faker.random.number({min: 0.1*10000, max: 100*10000, precision: 100}),
      meta: () => faker.company.catchPhrase(),
      state: (i: number) => (i < 3 ? "pending" : (i % 8 == 0) ? "rejected" : "committed"),
      created: (i: number) => faker.date.recent(i % 5).toJSON(),
      updated: (i: number) => faker.date.recent(i % 5).toJSON(),
      expires() {
        return (this as any).state == "pending" ? faker.date.future().toJSON() : undefined;
      }
    }),
    accountSettings: Factory.extend({
      acceptPaymentsAutomatically: true,
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
    // Create an account with settings for each member
    server.schema.members
      .all()
      .models.forEach(
        (member: ModelInstance<Record<string, any>>, i: number) => {
          const code = member.group.code;
          const accountCode = code + `${i}`.padStart(4, "0");
          const account = server.create("account", {
            code: accountCode,
            currency: server.schema.currencies.findBy({ code }),
            settings: server.create("accountSettings"),
          });
          member.update({ account });
        }
      );

    // Generate 25 transactions between the first account and the following 5 accounts.
    const accounts = server.schema.accounts.all();
    const account = accounts.models[0];
    const currency = account.currency;
    for (let i = 1; i < 6; i++) {
      const other = accounts.models[i];
      server.createList("transfer", 2, {
        payer: account,
        payee: other,
        currency
      });
      server.createList("transfer", 3, {
        payer: other,
        payee: account,
        currency
      });
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
    // Account settings
    server.get(`${urlAccounting}/:currency/accounts/:code/settings`, (schema: any, request) => {
      const currency = schema.currencies.findBy({code: request.params.currency});
      const account = schema.accounts.findBy({code: request.params.code, currencyId: currency.id});
      return schema.accountSettings.findBy({accountId: account.id});
    });
      
    // Account transfers.
    server.get(`${urlAccounting}/:currency/transfers`,
      (schema: any, request: any) => {
        if (request.queryParams["filter[account]"]) {
          // Custom filtering.
          const accountId = request.queryParams["filter[account]"];
          let transfers = schema.transfers.where((transfer: any) => transfer.payerId == accountId || transfer.payeeId == accountId);
          transfers = search(transfers, request);
          transfers = sort(transfers, request);
          return transfers;
        } else {
          throw new Error("Unexpected request!");
        }
      }
    );
    // Single transfer
    server.get(`${urlAccounting}/:currency/transfers/:id`,
      (schema: any, request: any) => {
        return schema.transfers.find(request.params.id);
      }
    )
    // Create transfer
    server.post(`${urlAccounting}/:currency/transfers`,
      (schema: any, request: any) => {
        const body = JSON.parse(request.requestBody)
        const transfer = body.data;
        const resource = schema.transfers.create({id: transfer.id, type: transfer.type, ...transfer.attributes});
        resource.update({
          payer: schema.accounts.find(transfer.relationships.payer.data.id),
          payee: schema.accounts.find(transfer.relationships.payee.data.id),
          currency: schema.currencies.find(transfer.relationships.currency.data.id)
        })
        return new Response(201, undefined, resource)
      }
    )
    // Edit settings
    server.patch(`${urlAccounting}/:currency/accounts/:code/settings`, (schema: any, request: any) => {
      const currency = schema.currencies.findBy({code: request.params.currency});
      const account = schema.accounts.findBy({code: request.params.code, currencyId: currency.id});
      const settings = schema.accountSettings.findBy({accountId: account.id});
      const body = JSON.parse(request.requestBody);
      settings.update(body.data.attributes);
      return new Response(200, undefined, settings);
    });
  }
};
