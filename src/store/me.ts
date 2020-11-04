import { Module, ActionContext } from "vuex";
import { Auth, User, AuthData } from "../plugins/Auth";
import { KOptions } from "src/boot/komunitin";
import KError, { KErrorCode } from "src/KError";
import { handleError } from "../boot/errors";

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
  await dispatch("users/load", {
    // We can't include account.currency since account is an external relationship.
    // However we can include both group.currency and members.account, both external
    // relationships with the same effect.
    include: "members,members.group,members.group.currency,members.account"
  });
  const userId = rootGetters["users/current"].id;
  commit("myUser", userId);
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
  return Promise.all([action1, action2]);
}

export default {
  state: () => ({
    tokens: auth.getStoredTokens(),
    // It is important to define the properties even if undefined in order to add the reactivity.
    userInfo: undefined,
    userId: undefined,
    accountId: undefined,
    location: undefined
  }),
  getters: {
    isLoggedIn: state =>
      state.userInfo !== undefined &&
      state.userId !== undefined &&
      auth.isAuthorized(state.tokens),
    myMember: (state, getters, rootState, rootGetters) => {
      if (state.userId !== undefined) {
        const user = rootGetters["users/one"](state.userId);
        if (user.members.length > 0) {
          return user.members[0];
        }
      }
      return undefined;
    },
    myAccount: (state, getters) => {
      return getters.myMember?.account
    }
  },
  mutations: {
    tokens: (state, tokens) => (state.tokens = tokens),
    userInfo: (state, userInfo) => (state.userInfo = userInfo),
    myUser: (state, userId) => (state.userId = userId),
    location: (state, location) => (state.location = location)
  },

  actions: {
    /**
     * Authorize user using email and password.
     * 
     * Does no throw exception on invalid credentials.
     */
    login: async (
      context: ActionContext<UserState, never>,
      payload: LoginPayload
    ) => {
      try {
        const tokens = await auth.login(payload.email, payload.password);
        context.commit("tokens", tokens);
        await loadUser(tokens.accessToken, context);
      } catch (error) {
        if (error instanceof KError && error.code == KErrorCode.AuthNoCredentials) {
          // Invalid credentials, but don't throw exception. 
          // User should check isLoggedIn getter, that will return false.
          context.dispatch("logout");
        } else {
          // Any unexpected error, throw it!
          throw error;
        }
      }
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
            context.dispatch("logout");
          }
          throw error;
        }
      }
    },
    /**
     * Logout current user.
     */
    logout: async ({commit}: ActionContext<UserState, never>) => {
      auth.logout();
      commit("tokens", undefined);
      commit("userInfo", undefined);
      commit("myUser", undefined);
    },
    /**
     * Get the current location from the device.
     */
    locate: async ({ commit }: ActionContext<UserState, never>) => {
      // Promisify navigator.geolocation API.
      const location = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          // Success handler.
          (position: Position) => {
            const location = [
              position.coords.longitude,
              position.coords.latitude
            ];
            // Resolve promise with location array.
            resolve(location);
          },
          // Error handler
          (error: PositionError) => {
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
    }
  }
} as Module<UserState, never>;
