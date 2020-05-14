// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "miragejs";

import SocialServer from "./SocialServer";
import AuthServer from "./AuthServer";
import UUIDIndetityManager from "./UUIDManager";
import AccountingServer from "./AccountingServer";

console.debug("Mocking server responses with MirageJS.");

export default new Server({
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
    SocialServer.seeds(server);
    AccountingServer.seeds(server);
  },
  routes() {
    // Disable output of all intercepted requests.
    this.logging = false;

    if (process.env.USE_MIRAGE) {
      this.timing = parseInt(process.env.USE_MIRAGE);
    }

    AuthServer.routes(this);
    SocialServer.routes(this);
    AccountingServer.routes(this);
    this.passthrough("/service-worker.js");
  }
});
