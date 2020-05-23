import { Module, ActionContext } from "vuex";
interface UIState {
  drawerPersistent: boolean;
  drawerState: boolean;
}

export default {
  state: () => ({
    drawerPersistent: true,
    drawerState: true
  }),
  getters: {
    drawerExists: (state, getters, rootState, rootGetters) =>
      rootGetters["isLoggedIn"]
  },
  mutations: {
    drawerPersistent: (state, value: boolean) =>
      (state.drawerPersistent = value),
    drawerState: (state, value: boolean) => (state.drawerState = value)
  },
  actions: {
    toogleDrawer: ({ state, commit }: ActionContext<UIState, never>) =>
      commit("drawerState", !state.drawerState)
  }
} as Module<UIState, never>;
