import { Module, ActionContext } from "vuex";
import { Auth, User, AuthData } from "../plugins/Auth";
import { KOptions } from "src/boot/komunitin";
import KError, { KErrorCode } from "src/KError";

// Exported just for testing purposes.
export const auth = new Auth({
  clientId: KOptions.apis.auth.clientId,
  tokenEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.token,
  userInfoEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserState {
  userInfo?: User;
  tokens?: AuthData;
  memberId?: string;
  /**
   * Current location, provided by device.
   */
  location?: [number, number];
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
  { commit, dispatch, rootGetters }: ActionContext<UserState, never>
) {
  // Get the OIDC userInfo data.
  const action1 = auth.getUserInfo(accessToken).then(userInfo => {
    commit("userInfo", userInfo);
  });
  // Load the Social API users/me endpoint.
  const action2 = dispatch("users/load", {
    include: "members,members.group"
  }).then(() => {
    const memberId = rootGetters["users/current"].id;
    commit("myMember", memberId);
  });
  // Run these two calls in "parallel".
  return Promise.all([action1, action2]);
}

export default {
  state: () => ({
    tokens: auth.getStoredTokens(),
    // It is important to define the property even if undefined in order to add the reactivity.
    userInfo: undefined,
    memberId: undefined,
    location: undefined,
  }),
  getters: {
    isLoggedIn: state =>
      state.userInfo !== undefined && state.memberId !== undefined && auth.isAuthorized(state.tokens),
    myMember: (state, getters, rootState, rootGetters) => {
      if (state.memberId !== undefined) {
        const user = rootGetters["users/one"](state.memberId);
        if (user.members.length > 0) {
          return user.members[0];
        }
      }
      return undefined;
    }
  },
  mutations: {
    tokens: (state, tokens) => (state.tokens = tokens),
    userInfo: (state, userInfo) => (state.userInfo = userInfo),
    myMember: (state, memberId) => (state.memberId = memberId),
    location: (state, location) => (state.location = location),
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
      return loadUser(tokens.accessToken, context);
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
          return loadUser(tokens.accessToken, context);
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
    logout: async(context: ActionContext<UserState, never>) => {
      await auth.logout();
      context.commit("tokens", undefined);
      context.commit("userInfo", undefined);
      context.commit("myMember", undefined);
    },
    /**
     * Get the current location from the device.
     */
    locate: async({commit}: ActionContext<UserState, never>) => {
      // Promisify navigator.geolocation API.
      try {
        const location = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            // Success handler.
            (position: Position) => {
              const location = [position.coords.longitude, position.coords.latitude];
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
              // Reject promise with KError
              reject(kerror);
            },
            { maximumAge: 1500000, timeout: 100000 }
          );
        });
        commit("location", location);
      } catch (error) {
        // Log error, but dont throw exception as App should work
        // without user location!
        // FIXME !!!!!
        commit("location", undefined);
      }
    }
  }
} as Module<UserState, never>;
