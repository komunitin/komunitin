import Vue from "vue";
import Vuex from "vuex";
import { Resources } from "./resources";
import { KOptions } from "src/boot/komunitin";
import {
  User,
  Group,
  Contact,
  Offer,
  Need,
  Category,
  Currency,
  Account,  
  Member,
  Transfer
} from "src/store/model";
// Import logged-in user module
import me from "./me";
import ui from "./ui";

Vue.use(Vuex);

// Build modules for Social API:
const socialUrl = KOptions.apis.social;
// `groups` resource does not follow the general pattern for endpoints.
const groups = new (class extends Resources<Group, unknown> {
  collectionEndpoint = () => "/groups";
  resourceEndpoint = (code: string) => `/${code}`;
})("groups", socialUrl);

const contacts = new Resources<Contact, unknown>("contacts", socialUrl);
const members = new Resources<Member, unknown>("members", socialUrl);

const offers = new Resources<Offer, unknown>("offers", socialUrl);
const needs = new Resources<Need, unknown>("needs", socialUrl);
const categories = new Resources<Category, unknown>("categories", socialUrl);
const users = new (class extends Resources<User, unknown> {
  collectionEndpoint = () => "/users";
  resourceEndpoint = () => "/users/me";
})("users", socialUrl);

// Build modules for Accounting API:
const accountingUrl = KOptions.apis.accounting;
// Build modules for Accounting API:
// `currencies` resource does not follow the general pattern for endpoints.
const currencies = new (class extends Resources<Currency, unknown> {
  collectionEndpoint = () => "/currencies";
  resourceEndpoint = (code: string) => `/${code}/currency`;
  /**
   * Defines the inverse of the external relation group -> currency, so 
   * actions to currencies module can be called with include=group.
   */
  inverseRelationships = () => ({
    group: {
      module: "groups",
      field: "currency"
    }
  })
})("currencies", accountingUrl);

const accounts = new (class extends Resources<Account, unknown> {
  /**
   * Defines the inverse of the external relation member -> account, so 
   * actions to accounts module can be called with include=member.
   */
  inverseRelationships = () => ({
    member: {
      module: "members",
      field: "account"
    }
  })
})("accounts", accountingUrl);

const transfers = new Resources<Transfer, unknown>("transfers", accountingUrl);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      // Logged-in user module
      me,
      // User interface module.
      ui,

      // Resource modules:

      // Remark: The names of the resource modules must
      // be equal to the type property of the resources they
      // represent.

      // Social API resource modules.
      users,
      groups,
      contacts,
      members,
      offers,
      needs,
      categories,
      // Accounting API resource modules.
      currencies,
      accounts,
      transfers
    },
    // enable strict mode (adds overhead!) for dev mode only
    strict: process.env.DEV === "true"
  });

  return Store;
}
