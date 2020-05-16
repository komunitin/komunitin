import { Module, ActionContext } from "vuex";
import { Auth, User, AuthData } from "../plugins/Auth";
import { KOptions } from "src/boot/komunitin";

const auth = new Auth({
  clientId: KOptions.apis.auth.clientId,
  tokenEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.token,
  userInfoEndpoint: KOptions.apis.auth.issuer + KOptions.apis.auth.userInfo
});

export interface LoginPayload {
  email: string,
  password: string,
}

export interface UserState {
  userInfo?: User,
  tokens?: AuthData
}

export default {
  state: () => ({
    tokens: auth.getStoredTokens(),
    // It is important to define the property even if undefined in order to add the reactivity.
    userInfo: undefined,
  }),
  getters: {
    isLoggedIn: (state) => (state.userInfo !== undefined) && auth.isAuthorized(state.tokens)
  },
  mutations: {
    tokens: (state, tokens) => state.tokens = tokens,
    userInfo: (state, userInfo) => state.userInfo = userInfo
  },
  actions: {
    /**
     * Authorize user using email and password.
     */
    login: async (
      { commit }: ActionContext<UserState, never>,
      payload: LoginPayload
    ) => {
      const tokens = await auth.login(payload.email, payload.password);
      commit("tokens", tokens);
      const userInfo = await auth.getUserInfo(tokens.accessToken);
      commit("userInfo", userInfo);
    },
    /**
     * Silently authorize user using stored credentials.
     */
    authorize: async({ commit, state }: ActionContext<UserState, never>) => {
      const tokens = await auth.authorize(state.tokens)
      commit("tokens", tokens);
      const userInfo = await auth.getUserInfo(tokens.accessToken);
      commit("userInfo", userInfo);
    }
  }
} as Module<UserState, never>