import { ActionContext } from "vuex";
import { Resources, ResourcesState, LoadListPayload, LoadPayload } from "./resources";
import { Member } from "./model";

export interface LoadMemberListPayload extends LoadListPayload {
  /**
   * Also fetch the related `account` objects from Accounting API.
   */
  includeAccounts?: boolean;
}

export interface LoadMemberPayload extends LoadPayload {
  /**
   * Also fetch the related `account` object from Accounting API.
   */
  includeAccount?: boolean;
}

interface MembersState extends ResourcesState<Member> {
  /**
   * The code of the group/currency from the last call to loadList.
   * Internal data not to be used from outside this module. Null means
   * that we're not adding accounts to the members list.
   */
  nextCurrency: string | null
}

/**
 * Vuex Module for member resources.
 *
 * Extends Resources generic module to add the relation from a member
 * to their related account from the Accounting API.
 */
export class Members<S> extends Resources<Member, S> {
  /**
   * @param baseUrl The API URL.
   */
  public constructor(baseUrl: string) {
    super("members", baseUrl);
    // Augment module state and mutations.
    this.state = {
      ...this.state,
      nextCurrency: null
    } as MembersState;
    this.mutations = {
      ...this.mutations,
      setNextCurrency: (state: MembersState, code: string) => {
        state.nextCurrency = code;
      }
    } as never;
  }

  /**
   * Load related accounts after loading members list.
   */
  protected async loadList(
    context: ActionContext<MembersState, S>,
    payload: LoadMemberListPayload
  ) {
    // Load the list of members.
    await super.loadList(context, payload);
    // Load accounts.
    await this.handleIncludeAccounts(context, payload);
  }

  /**
   * Load related accounts after loading next list items.
   */
  protected async loadNext(context: ActionContext<MembersState, S>) {
    await super.loadNext(context);
    await this.handleIncludeAccounts(context);
  }

  /**
   * Load related account after loading member.
   */
  protected async load(context: ActionContext<MembersState, S>, payload: LoadMemberPayload) {
    await super.load(context, payload);
    if (payload.includeAccount) {
      await context.dispatch("loadUrl", {url: context.getters.current.attributes.account.links.related});
    }
  }

  /**
   * Load related accounts.
   */
  protected async handleIncludeAccounts(
    context: ActionContext<MembersState, S>,
    payload?: LoadMemberListPayload
  ) {
    if (payload !== undefined) {
      // Save the group code for loadNext calls, and set to null if we're 
      // not inlcuding accounts.
      const currencyCode = payload.includeAccounts ? payload.group : null;
      context.commit("setNextCurrency", currencyCode);
    } else {
      // This is a call from loadNext. Create payload from nextCurrency state variable.
      payload = {
        includeAccounts: context.state.nextCurrency != null,
        // if includeAccounts is false, then group doesn't matter.
        group: context.state.nextCurrency ?? "", 
      }
    }

    if (payload.includeAccounts) {
      const members = context.getters["currentList"] as Member[];
      const ids = members.map(member => member.attributes.account.data.id);
      await context.dispatch("accounts/loadList", {
        group: payload.group,
        filter: {
          id: ids.join(",")
        }
      } as LoadListPayload, {root: true});
    }
  }

  /**
   * Add a dynamic getter to the `account` property of the given member 
   * resource in addition to the standard relationships.
   * 
   * @param rootGetters The root store getters object.
   * @param main The resource object.
   */
  protected relatedGetters(
    rootGetters: Record<string, (id: string) => Member>,
    main: Member
  ): Member {
    main = super.relatedGetters(rootGetters, main) as Member;
    Object.defineProperty(main, "account", {
      get: function() {
        const resourceId = main.attributes.account.data;
        return rootGetters[resourceId.type + "/one"](resourceId.id);
      }
    })
    return main;
  }
}
