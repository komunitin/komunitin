// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "miragejs";
import { KOptions } from "src/boot/komunitin";

import SocialServer from "./SocialServer";
import AuthServer from "./AuthServer";
import UUIDIndetityManager from "./UUIDManager";
import AccountingServer from "./AccountingServer";
import NotificationsServer from "./NotificationsServer";

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
    this.logging = true;

    if (process.env.MOCK_TIMEOUT) {
      this.timing = parseInt(process.env.MOCK_TIMEOUT);
    }
    if (process.env.MOCK_AUTH) {
      AuthServer.routes(this);
    } else {
      this.passthrough(KOptions.url.auth + "/**");
    }
    if (process.env.MOCK_SOCIAL) {
      SocialServer.routes(this);
    } else {
      this.passthrough(KOptions.url.social + "/**");
    }
    if (process.env.MOCK_ACCOUNTING) {
      AccountingServer.routes(this);
    } else {
      this.passthrough(KOptions.url.accounting + "/**");
    }
    if (process.env.MOCK_NOTIFICATIONS) {
      NotificationsServer.routes(this);
    } else {
      this.passthrough(KOptions.url.notifications + "/**");
    }

    this.passthrough("/service-worker.js");
    this.passthrough("https://firebaseinstallations.googleapis.com/**");
    this.passthrough("https://fcmregistrations.googleapis.com/**");
  }
});
