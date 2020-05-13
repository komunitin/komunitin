import { Module } from 'vuex';

import State from '../state';
import {SET_GROUP, SET_GROUPS, SET_CONTACTS, SET_CATEGORIES} from '../mutations-types';
import {LOAD_GROUPS, LOAD_GROUP, LOAD_GROUP_CATEGORIES} from '../actions-types';

import { Group, ResourceIdentifierObject, Category } from 'src/pages/groups/models/model';
import SocialApi from '../../services/Api/SocialApi';

export interface GroupsState {
  /**
   * Dictionary of all loaded groups.
   */
  groups: {[code: string]: Group};
  /**
   * Id of the group currently being viewed.
   */
  currentGroup: string | undefined;
  /**
   * Ordered list of groups currently being viewed.
   */
  currentGroups: string[];
}

export default {
  state: {
    groups: {},
    currentGroup: undefined,
    currentGroups: []
  },
  getters: {
    /**
     * Get the array of current groups
     */
    currentGroups: state => state.currentGroups.map(id => state.groups[id]),
    /**
     * Get the current group
     */
    currentGroup: state => state.currentGroup ? state.groups[state.currentGroup] : undefined,
    /**
     * Get contacts of the current group
     */
    currentGroupContacts: (state, getters, rootState, rootGetters) => 
      getters.currentGroup?.relationships.contacts.data.map((linkage: ResourceIdentifierObject) => rootGetters.contact(linkage.id))
  },
  mutations: {
    [SET_GROUPS](state, groups: Group[]) {
      state.currentGroups = []
      groups.forEach(group => {
        state.groups[group.id] = group;
        state.currentGroups.push(group.id);
      });
    },
    [SET_GROUP](state, group: Group) {
      state.currentGroup = group.id;
      state.groups[group.id] = group;
    },
    [SET_GROUP_CATEGORIES](state, categories: Category[]) {

    }
  },
  actions: {
    /**
     * Load a collection of groups with their contacts. They will be accessible through 
     * currentGroups getter.
     * 
     * @param store
     * @param payload Object containing optional `location` and `search` properties.
     */
    async [LOAD_GROUPS]({ commit }, payload) {
      const response = await SocialApi.getGroups(payload.location, payload.search);
      commit(SET_GROUPS, response.groups);
      commit(SET_CONTACTS, response.contacts);
    },
    /**
     * Load a group identified by their code. Also loads 
     * 
     * @param store Store
     * @param payload Object containing the group code identifier.
     */
    async [LOAD_GROUP]({commit}, payload) {
      const response = await SocialApi.getGroup(payload.code);
      commit(SET_GROUP, response.group);
      commit(SET_CONTACTS, response.contacts);
    },
    /**
     * Load the categories of a group.
     * 
     * @param store Store
     * @param payload Object containing the group code identifier.
     */
    async [LOAD_GROUP_CATEGORIES]({commit}, payload) {
      const response = await SocialApi.getCategories(payload.code);
      commit(SET_CATEGORIES, response.data);
      commit(SET_GROUP_CATEGORIES, response.data);
    }
  }
} as Module<GroupsState, State>;