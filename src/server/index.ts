// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Registry, Server } from "miragejs";
import { KOptions } from "src/boot/komunitin";

import SocialServer from "./SocialServer";
import AuthServer from "./AuthServer";
import UUIDIndetityManager from "./UUIDManager";
import AccountingServer from "./AccountingServer";
import NotificationsServer from "./NotificationsServer";
import { AnyFactories, AnyModels } from "miragejs/-types";

// Ensure boolean.
const mirageDevEnvironment = process.env.MOCK_ENVIRONMENT == "development";

// eslint-disable-next-line no-console
console.debug(`Mocking server responses with MirageJS, mode ${process.env.MOCK_ENVIRONMENT}.`);

const server = new Server({
  timing : mirageDevEnvironment ? 200 : 0,
  //logging: mirageDevEnvironment,
  logging: true,
  environment: process.env.MOCK_ENVIRONMENT,
  serializers: {
    ...SocialServer.serializers,
    ...AccountingServer.serializers
  },
  identityManagers: {
    application: UUIDIndetityManager
  } as any,
  models: {
    ...SocialServer.models,
    ...AccountingServer.models
  },
  factories: {
    ...SocialServer.factories,
    ...AccountingServer.factories
  },
  seeds(server) {
    _createAllData(server)
  },
  routes() {
    if (process.env.MOCK_AUTH == "true") {
      AuthServer.routes(this);
    } else {
      this.passthrough(KOptions.url.auth + "/**");
    }
    if (process.env.MOCK_SOCIAL == "true") {
      SocialServer.routes(this);
    } else {
      this.passthrough(KOptions.url.social + "/**");
    }
    if (process.env.MOCK_ACCOUNTING == "true") {
      AccountingServer.routes(this);
    } else {
      this.passthrough(KOptions.url.accounting + "/**");
    }
    if (process.env.MOCK_NOTIFICATIONS == "true") {
      NotificationsServer.routes(this);
    } else {
      this.passthrough(KOptions.url.notifications + "/**");
    }

    this.passthrough("/service-worker.js");
    this.passthrough("https://firebaseinstallations.googleapis.com/**");
    this.passthrough("https://fcmregistrations.googleapis.com/**");
  }
});

export default server;

/**
 * To be called from tests that want to load the full dataset.
 */
export function seeds() {
  _createAllData(server);
}

function _createAllData(server: Server<Registry<AnyModels, AnyFactories>>): void {
  SocialServer.seeds(server);
  AccountingServer.seeds(server);
}
