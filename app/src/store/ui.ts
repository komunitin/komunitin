import { Module, ActionContext } from "vuex";
export interface UIState {
  drawerPersistent: boolean;
  drawerState: boolean;
  notificationsBannerDismissed: boolean;
  locationBannerDismissed: boolean;
}

export default {
  state: () => ({
    drawerPersistent: true,
    drawerState: true,
    notificationsBannerDismissed: false,
    locationBannerDismissed: false,
  }),
  getters: {
    drawerExists: (state, getters, rootState, rootGetters) =>
      rootGetters["isLoggedIn"]
  },
  mutations: {
    drawerPersistent: (state, value: boolean) =>
      (state.drawerPersistent = value),
    drawerState: (state, value: boolean) => (state.drawerState = value),
    notificationsBannerDismissed: (state, value: boolean) => (state.notificationsBannerDismissed = value),
    locationBannerDismissed: (state, value: boolean) => (state.locationBannerDismissed = value)
  },
  actions: {
    toogleDrawer: ({ state, commit }: ActionContext<UIState, never>) =>
      commit("drawerState", !state.drawerState)
  }
} as Module<UIState, never>;
