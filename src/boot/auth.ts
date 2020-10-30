import { boot } from "quasar/wrappers";


export default boot(({ router, store }) => {
  // Prevent access to paths that need authorization.
  router.beforeEach(async (to, from, next) => {
    try {
      await store.dispatch("authorize");
      // User is logged in.
      if (to.path == "/" || to.path.startsWith("/login")) {
        // Redirect to dashboard. But since dashboard is still not developed, redirect to needs page.
        next(`/groups/${store.getters.myMember.group.attributes.code}/needs`);
      } else {
        next();
      }
    } catch (error) {
      // User is not logged in. If user is trying to access a private node, bring them to login page
      // so they are redirected to the desired path after login.
      
      //Private nodes are all but:
      //  - /
      //  - /login*
      //  - /groups
      //  - /groups/XXXX
      if (to.path != "/" && !to.path.startsWith("/login") && to.path != "/groups" && !(/^\/groups\/\w+$/.test(to.path))) {
        next({
          path: "/login-mail",
          query: {
            redirect: to.path
          }});
      } else {
        next();
      }
      
    }
  });
});
