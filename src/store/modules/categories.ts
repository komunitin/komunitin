import { Module } from 'vuex';

import State from '../state';
import { Category } from 'src/pages/groups/models/model';
import { SET_CATEGORIES } from '../mutations-types';
import { LOAD_CATEGORIES } from '../actions-types';

import SocialApi from '../../services/Api/SocialApi';

export interface CategoriesState {
  [key: string]: Category;
}

export default {
  state: {},
  getters: {
    category: (state) => (id: string) => state[id]
  },
  mutations: {
    [SET_CATEGORIES](state, categories: Category[]) {
      categories.forEach(category => state[category.id] = category);
    }
  }
} as Module<CategoriesState, State>;