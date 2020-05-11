import { Module } from 'vuex';
import { Group } from 'src/pages/groups/models/model';
import State from '../state';

export interface GroupsState {
    [code: string]: Group
}

export default {
  state: {},
  getters: {},
  mutations: {
    setGroups(state, groups) {
        state = groups;
    }
  },
  actions:{}
  
} as Module<GroupsState, State>;