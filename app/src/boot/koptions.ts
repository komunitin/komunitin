import { boot } from "quasar/wrappers";

/**
 * Load environment variables from process.env and organize them in a typed
 * object so they are more comfortable to use across the app.
 */
const KOptions = {
  url: {
    /**
     * Authorization API URL.
     */
    auth: process.env.AUTH_URL ?? "http://localhost:8080/auth",
    /**
     * Social API URL.
     */
    social: process.env.SOCIAL_URL ?? "http://localhost:8080/social",
    /**
     * Accounting API URL.
     */
    accounting: process.env.ACCOUNTING_URL ?? "http://localhost:8080/auth",
    /**
     * Notifications API URL.
     */
    notifications: process.env.NOTIFICATIONS_URL ?? "http://localhost:8080/notifications"
  },
  oauth: {
    /**
     * OAuth 2 ClientId constant.
     */
    clientid: process.env.OAUTH_CLIENTID ??  "komunitin-app"
  }
}

// For use outside Vue components.
export { KOptions };

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $KOptions: typeof KOptions;
  }
}

export default boot(({ app }) => {
  // Augment Vue interface with $KOptions member.
  app.config.globalProperties.$KOptions = KOptions;
});
