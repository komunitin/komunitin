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
    accounting: process.env.ACCOUNTING_URL ?? "http://localhost:8080/accounting",
    /**
     * Notifications API URL.
     */
    notifications: process.env.NOTIFICATIONS_URL ?? "http://localhost:8080/notifications",
    /**
     * Files API URL.
     */
    files: process.env.FILES_URL ?? "http://localhost:8080/files"
  },
  oauth: {
    /**
     * OAuth 2 ClientId constant.
     */
    clientid: process.env.OAUTH_CLIENTID ??  "komunitin-app"
  },
  gtag: {
    /**
     * Google Measurement Id.
     */
    id: process.env.GTAG_ID ?? ""
  }
}

// For use outside Vue components.
export { KOptions };
