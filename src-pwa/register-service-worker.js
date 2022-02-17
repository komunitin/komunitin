// This is not TypeScript since it is not properly handled by Quasar right now. It will be added to v3 version, so 
// we should move to TS when updating Quasar to v3.
// See https://quasar.dev/quasar-cli/developing-pwa/pwa-with-typescript

import { register } from "register-service-worker";

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: "./" },

  async ready(/* registration */) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("App is being served from cache by a service worker.");
    }
    //const subscription = await subscribeToPushNotifications(registration);
    //return sendSubscriptionToServer(subscription);
  },

  registered(/* registration */) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Service worker has been registered.");
    }
  },

  cached(/* registration */) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Content has been cached for offline use.");
    }
  },

  updatefound(/* registration */) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("New content is downloading.");
    }
  },

  updated(/* registration */) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("New content is available; please refresh.");
    }
  },

  offline() {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    }
  },

  error(err) {
    if (process.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("Error during service worker registration:", err);
    }
  }
});

