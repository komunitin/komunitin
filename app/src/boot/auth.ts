import { boot } from "quasar/wrappers";


export default boot(({ router, store }) => {
  // Prevent access to paths that need authorization.
  router.beforeEach(async (to) => {
    try {
      if (to.query.token) {
        // Login with url token.
        await store.dispatch("authorizeWithCode", {code: to.query.token});
      } else {
        // Login with stored credentials
        await store.dispatch("authorize");
      }
      // User is logged in.
      if (to.path == "/" || to.path.startsWith("/login")) {
        if (to.query.redirect) {
          return to.query.redirect as string;
        } else {
          // Redirect to dashboard. But since dashboard is still not developed, redirect to needs page.
          return `/groups/${store.getters.myMember.group.attributes.code}/needs`;
        }
      }
      return true
    } catch (error) {
      // User is not logged in. If user is trying to access a private node, bring them to login page
      // so they are redirected to the desired path after login.
      
      // Public pages have a special flag.
      if (!to.meta.public) {
        return {
          path: "/login-mail",
          query: {
            redirect: to.path
          }};
      }
      return true
    }
  });
});
