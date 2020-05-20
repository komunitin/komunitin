import { boot } from "quasar/wrappers";


export default boot(({ router, store }) => {
  // Prevent access to paths that need authorization.
  router.beforeEach(async (to, from, next) => {
    try {
      await store.dispatch("authorize");
      // User is logged in.
      if (to.path == "/" || to.path.startsWith("/login")) {
        // Redirect to dashboard. But since dashboard is still not developed, redirect to group page.
        next(`/groups/${store.getters.myMember.group.attributes.code}`);
      } else {
        next();
      }
    } catch (error) {
      // User is not logged in.
      // That'd be the place to redirect in case of tryinc to access a restricted route,
      // but so far all the pages we've developed are publicly accessible.
      next();
    }
  });
});
