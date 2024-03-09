import { createStore, Store } from "vuex";
import { Resources, ResourcesState } from "./resources";
import { KOptions } from "src/boot/koptions";
import {
  User,
  UserSettings,
  Group,
  Contact,
  Offer,
  Need,
  Category,
  Currency,
  Account,
  AccountSettings,
  Member,
  Transfer,
  GroupSignupSettings
} from "src/store/model";
// Import logged-in user module
import me, { UserState } from "./me";
import ui, { UIState } from "./ui";
import createPersistPlugin from "./persist";
import KError, { KErrorCode } from "src/KError";

// Build modules for Social API:
const socialUrl = KOptions.url.social;
// `groups` resource does not follow the general pattern for endpoints.
const groups = new (class extends Resources<Group, unknown> {
  collectionEndpoint = () => "/groups";
  resourceEndpoint = (code: string) => `/${code}`;
})("groups", socialUrl);
const signupSettings = new Resources<GroupSignupSettings, unknown>("signup-settings", socialUrl);

const contacts = new Resources<Contact, unknown>("contacts", socialUrl);
const members = new Resources<Member, unknown>("members", socialUrl);

const offers = new Resources<Offer, unknown>("offers", socialUrl);
const needs = new Resources<Need, unknown>("needs", socialUrl);
const categories = new Resources<Category, unknown>("categories", socialUrl);
const users = new (class extends Resources<User, unknown> {
  collectionEndpoint = () => "/users";
  resourceEndpoint = () => "/users/me";
})("users", socialUrl);

const userSettings = new (class extends Resources<UserSettings, unknown> {
  collectionEndpoint = () => {throw new KError(KErrorCode.ScriptError, "User settings cannot be listed");};
  resourceEndpoint = () => "/users/me/settings";
})("user-settings", socialUrl);

// Build modules for Accounting API:
const accountingUrl = KOptions.url.accounting;
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

const accountSettings = new (class extends Resources<AccountSettings, unknown> {
  collectionEndpoint = () => {throw new KError(KErrorCode.ScriptError, "Account settings cannot be listed");};
  resourceEndpoint = (code: string, groupCode: string) => `/${groupCode}/accounts/${code}/settings`;
})("account-settings", accountingUrl)

const transfers = new Resources<Transfer, unknown>("transfers", accountingUrl);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default createStore({
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
    "user-settings": userSettings,
    groups,
    contacts,
    members,
    offers,
    needs,
    categories,
    // Accounting API resource modules.
    currencies,
    accounts,
    "account-settings": accountSettings,
    transfers,
    "signup-settings": signupSettings
  },
  // enable strict mode (adds overhead!) for dev mode only
  strict: process.env.DEV === "true",
  plugins: [createPersistPlugin("komunitin")]
});

declare module '@vue/runtime-core' {
  interface State {
    me: UserState
    ui: UIState
    users: ResourcesState<User>
    groups: ResourcesState<Group>
    contacts: ResourcesState<Contact>
    members: ResourcesState<Member>
    offers: ResourcesState<Offer>
    needs: ResourcesState<Need>
    categories: ResourcesState<Category>
    currencies: ResourcesState<Currency>
    accounts: ResourcesState<Account>
    transfers: ResourcesState<Transfer>
  }
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
