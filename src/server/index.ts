// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "miragejs";

import SocialServer from "./SocialServer";
import AuthServer from "./AuthServer";
import UUIDIndetityManager from "./UUIDManager";
import AccountingServer from "./AccountingServer";

// eslint-disable-next-line no-console
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

    if (process.env.MOCK_TIMEOUT) {
      this.timing = parseInt(process.env.MOCK_TIMEOUT);
    }
    if (process.env.MOCK_AUTH) {
      AuthServer.routes(this);
    } else {
      this.passthrough(process.env.URL_AUTH + "/**");
    }
    if (process.env.MOCK_SOCIAL) {
      SocialServer.routes(this);
    } else {
      this.passthrough(process.env.URL_SOCIAL + "/**");
    }
    if (process.env.MOCK_ACCOUNTING) {
      AccountingServer.routes(this);
    } else {
      this.passthrough(process.env.URL_ACCOUNTING + "/**");
    }

    this.passthrough("/service-worker.js");
  }
});
