import { Module, ActionContext } from "vuex";
import { Auth, User, AuthData } from "../plugins/Auth";
import { KOptions } from "src/boot/komunitin";
import KError, { KErrorCode } from "src/KError";
import { handleError } from "../boot/errors";
import { Notifications } from "src/plugins/Notifications";
import { i18n } from "../boot/i18n"

// Exported just for testing purposes.
export const auth = new Auth({
  clientId: KOptions.oauth.clientid,
  tokenEndpoint: KOptions.url.auth + "/token",
  userInfoEndpoint: KOptions.url.auth + "/UserInfo"
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserState {
  userInfo?: User;
  tokens?: AuthData;
  userId?: string;
  /**
   * Current location, provided by device.
   */
  location?: [number, number];
  /**
   * Subscription to push notifications.
   */
  subscriptionToken?: string;
}

/**
 * Load OIDC user info.
 */
async function loadUserInfo(accessToken: string, { commit }: ActionContext<UserState, never>) {
  return auth.getUserInfo(accessToken).then(userInfo => {
    commit("userInfo", userInfo);
  });
}

/**
 * Load member and account resources for current user.
 */
async function loadUserData(accessToken: string,
  { commit, dispatch, rootGetters }: ActionContext<UserState, never>
) {
  // Resource actions allow including external relationships such as members.account,
  // but we can't use it right here because we still don't know the group code, which
  // is necessary for this process to work. So we manually do the twy calls.
  await dispatch("users/load", {
    include: "members,members.group"
  });
  const user = rootGetters["users/current"];

  // We here compute the currency code and account code from their URLS so we can fetch 
  // them using the store methods. This is kind of a perversion of HATEOAS since we could 
  // more coherently fetch them directly from the provided link. But we have all the store 
  // infrastructure like this, so this is a little hack that I hope won't make problems.
  const currencyUrl = user.members[0].group.relationships.currency.links.related;
  // https://.../accounting/<GROUP>/currency
  const currencyCode = currencyUrl.split('/').slice(-2)[0];
  const accountUrl = user.members[0].relationships.account.links.related;
  // https://.../accounting/<GROUP>/accounts/<CODE>
  const accountCode = accountUrl.split('/').slice(-1)[0];

  // Fetch currency and account from accounting API.
  await dispatch("accounts/load", {group: currencyCode, code: accountCode, include: "currency"});
  commit("myUser", user.id);
}

/**
 * Helper function that loads the user data after being logged in and having
 * the credentials.
 *
 * @param accessToken The access token
 * @param commit The local commit function.
 * @param dispatch The vuex Dispatch object.
 */
async function loadUser(
  accessToken: string,
  context: ActionContext<UserState, never>
) {
  // Get the OIDC userInfo data.
  const action1 = loadUserInfo(accessToken, context);
  // Load the Social API users/me endpoint.
  const action2 = loadUserData(accessToken, context);
  // Run these two calls in "parallel".
  await Promise.all([action1, action2]);
}

export default {
  state: () => ({
    tokens: auth.getStoredTokens(),
    // It is important to define the properties even if undefined in order to add the reactivity.
    userInfo: undefined,
    userId: undefined,
    accountId: undefined,
    location: undefined,
    subscriptionToken: undefined
  }),
  getters: {
    isLoggedIn: state =>
      state.userInfo !== undefined &&
      state.userId !== undefined &&
      auth.isAuthorized(state.tokens),
    isSubscribed: state =>
      state.subscriptionToken !== undefined,
    myUser: (state, getters, rootState, rootGetters) => {
      if (state.userId !== undefined) {
        return rootGetters["users/one"](state.userId);
      }
      return undefined;
    },
    myMember: (state, getters) => {
      const user = getters.myUser;
      if (user?.members.length > 0) {
        return user.members[0];
      }
      return undefined;
    },
    myAccount: (state, getters) => {
      return getters.myMember?.account
    },
    accessToken: (state) => 
      state.tokens?.accessToken
  },
  mutations: {
    tokens: (state, tokens) => (state.tokens = tokens),
    userInfo: (state, userInfo) => (state.userInfo = userInfo),
    myUser: (state, userId) => (state.userId = userId),
    location: (state, location) => (state.location = location),
    subscription: (state, subscriptionToken) => (state.subscriptionToken = subscriptionToken)
  },

  actions: {
    /**
     * Authorize user using email and password.
     */
    login: async (
      context: ActionContext<UserState, never>,
      payload: LoginPayload
    ) => {
      const tokens = await auth.login(payload.email, payload.password);
      context.commit("tokens", tokens);
      await loadUser(tokens.accessToken, context);
    },
    /**
     * Silently authorize user using stored credentials. Throws exception (rejects)
     * on failed authorization.
     */
    authorize: async (context: ActionContext<UserState, never>) => {
      if (!context.getters.isLoggedIn) {
        try {
          const tokens = await auth.authorize(context.state.tokens);
          context.commit("tokens", tokens);
          await loadUser(tokens.accessToken, context);
        } catch (error) {
          // Couldn't authorize. Delete credentials so we don't attempt another
          // call next time.
          if (context.state.tokens) {
            await context.dispatch("logout");
          }
          throw error;
        }
      }
    },
    /**
     * Logout current user.
     */
    logout: async (context: ActionContext<UserState, never>) => {
      auth.logout();
      context.commit("tokens", undefined);
      context.commit("userInfo", undefined);
      context.commit("myUser", undefined);
    },
    /**
     * Get the current location from the device.
     */
    locate: async ({ commit }: ActionContext<UserState, never>) => {
      // Promisify navigator.geolocation API.
      const location = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          // Success handler.
          (position: GeolocationPosition) => {
            const location = [
              position.coords.longitude,
              position.coords.latitude
            ];
            // Resolve promise with location array.
            resolve(location);
          },
          // Error handler
          (error: GeolocationPositionError) => {
            const codes = [] as KErrorCode[];
            codes[error.TIMEOUT] = KErrorCode.PositionTimeout;
            codes[error.POSITION_UNAVAILABLE] = KErrorCode.PositionUnavailable;
            codes[error.PERMISSION_DENIED] = KErrorCode.PositionPermisionDenied;
            const kerror = new KError(codes[error.code], error.message, error);
            // Don't crash the application on location error. Just log it and continue.
            // The app should be able to continue without location info.
            handleError(kerror);
            resolve(undefined);
          },
          { maximumAge: 1500000, timeout: 100000 }
        );
      });
      commit("location", location);
    },
    /**
     * Subscribe to push notifications
    */
    subscribe: async (context: ActionContext<UserState, never>) => {
      if (!context.getters.isSubscribed && context.getters.isLoggedIn) {
        const notifications = new Notifications();

        const token = await notifications.subscribe(
          context.getters.myUser, 
          context.getters.myMember,
          {
            locale: i18n.locale
          },
          context.getters.accessToken);
        context.commit("subscription", token);
      }
    }
  }
} as Module<UserState, never>;
