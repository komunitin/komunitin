import { Module } from "vuex";

import State from "../state";
import { SET_CONTACTS } from "../mutations-types";
import { Contact } from "src/pages/groups/models/model";

export interface ContactsState {
  [key: string]: Contact
}

export default {
  state: {},
  getters: {
    contact: (state) => (id:string) => state[id]
  },
  mutations: {
    [SET_CONTACTS](state, contacts: Contact[]) {
      contacts.forEach((contact) => state[contact.id] = contact);
    }
  },
} as Module<ContactsState, State>;
