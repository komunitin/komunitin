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
  Member
} from "src/store/model";
// Import logged-in user module
import me from "./me";
import ui from "./ui";

Vue.use(Vuex);

// Build modules for Social API:
const socialUrl = KOptions.apis.social;
// `groups` resource does not follow the general pattern
// as other resources which is encoded in base class.
const groups = new (class extends Resources<Group, unknown> {
  collectionEndpoint = () => "/groups";
  resourceEndpoint = (code: string) => `/${code}`;
  externalRelationships = () => ["currency"];
})("groups", socialUrl);

const contacts = new Resources<Contact, unknown>("contacts", socialUrl);
const members = new (class extends Resources<Member, unknown> {
  externalRelationships = () => ["account"];
})("members", socialUrl);

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
// `currencies` resource does not follow the general pattern
// as other resources which is encoded in base class.
const currencies = new (class extends Resources<Currency, unknown> {
  collectionEndpoint = () => "/currencies";
  resourceEndpoint = (code: string) => `/${code}/currency`;
})("currencies", accountingUrl);

const accounts = new (class extends Resources<Account, unknown>{
  inverseRelationships = () => ({
    member: {
      module: "members",
      field: "account"
    }
  })
})("accounts", accountingUrl);

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
      accounts
    },
    // enable strict mode (adds overhead!) for dev mode only
    strict: process.env.DEV === "true"
  });

  return Store;
}
