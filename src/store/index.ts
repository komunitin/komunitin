import Vue from "vue";
import Vuex from "vuex";
import { Resources } from "./resources";
import { KOptions } from "src/boot/komunitin";
import {
  Group,
  Contact,
  Member,
  Offer,
  Category,
  Currency
} from "src/store/model";
// Import user module
import user from "./user";

Vue.use(Vuex);

// Build modules for Social API:
const socialUrl = KOptions.apis.social;
// `groups` resource does not follow the general pattern 
// as other resources which is encoded in base class.
const groups = new class extends Resources<Group, unknown> {
  collectionEndpoint = () => "/groups";
  resourceEndpoint = (code: string) => `/${code}`;
}("groups", socialUrl);

const contacts = new Resources<Contact, unknown>("contacts", socialUrl);
const members = new Resources<Member, unknown>("members", socialUrl);
const offers = new Resources<Offer, unknown>("offers", socialUrl);
const categories = new Resources<Category, unknown>("categories", socialUrl);

// Build modules for Accounting API:
const accountingUrl = KOptions.apis.accounting;
// Build modules for Accounting API:
// `currencies` resource does not follow the general pattern 
// as other resources which is encoded in base class.
const currencies = new class extends Resources<Currency, unknown> {
  collectionEndpoint = () => "/currencies";
  resourceEndpoint = (code: string) => `/${code}/currency`;
}("currencies", accountingUrl);


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
      user,
      groups,
      contacts,
      members,
      offers,
      categories,
      currencies
    },

    // enable strict mode (adds overhead!) for dev mode only
    strict: process.env.DEV === "true"
  });

  return Store;
}
