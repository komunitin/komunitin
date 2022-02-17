import Axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import KError, { KErrorCode } from "src/KError";
import { Module, ActionContext, Commit, Dispatch } from "vuex";
import {
  CollectionResponseInclude,
  ErrorObject,
  ResourceIdentifierObject,
  ResourceObject,
  ExternalResourceObject
} from "src/store/model";
import { UserState } from "./me";

export interface ResourcesState<T extends ResourceObject> {
  /**
   * Dictionary of resources indexed by id.
   */
  resources: { [id: string]: T };
  /**
   * Id of current resource.
   */
  current: string | null;
  /**
   * Array of ids of current list of resources. Note that for paginated responses,
   * this list contains the current chunk.
   */
  currentList: string[];
  /**
   * The url of the next page. null means no next page, undefined means unknown.
   */
  next: string | null | undefined;
}
/**
 * Object argument for the `loadList` action.
 */
export interface LoadListPayload {
  /**
   * The group where the records belong to.
   */
  group: string;
  /**
   * The search query.
   */
  search?: string;
  /**
   * The current location.
   */
  location?: [number, number];
  /**
   * Filter by fields. For example `{"member": "some-uuid"}`
   */
  filter?: { [field: string]: string };
  /**
   * Sort the results using this field.
   */
  sort?: string;
  /**
   * Inlude related resources.
   */
  include?: string;
}
/**
 * Object argument for the `load` action.
 */
export interface LoadPayload {
  /**
   * The resource code.
   */
  code: string;
  /**
   * The resource group.
   */
  group: string;
  /**
   * Optional comma-separated list of included relationship resources.
   */
  include?: string;
}

/**
 * Payload for the `loadNext` action.
 */
export interface LoadNextPayload {
  /**
   * The resource group.
   */
  group: string;
  /**
   * Optional comma-separated list of included relationship resources.
   */
  include?: string;
  /**
   * Sort the results using this field.
   */
  sort?: string;
}

type Getter = 
  & ((id: string) => ResourceObject)
  & ((conditions: Record<string, string>) => ResourceObject);

/**
 * Flexible Vuex Module used to retrieve, store and provide resources fetched from the
 * Komunitin Apis. The implementation is generic for any resource thanks to the JSONAPI
 * spec.
 *
 * Getters:
 * - `current`: Gives the current resource.
 * - `currentList`: Gives the cirrent list of resources. For paginated collections, this is the current chunk.
 * - `one`: Gives a resource given its id.
 *
 * Actions:
 * - `load`: Fetches the current resource. Accepts the `LoadPayload` argument.
 * - `loadList`: Fetches the current list of resources. Accepts the `LoadListPayload` argument.
 */
export class Resources<T extends ResourceObject, S> implements Module<ResourcesState<T>, S> {
  namespaced = true;

  /**
   * The resource type.
   */
  readonly type: string;
  /**
   * The API base URL.
   */
  readonly baseUrl: string;

  /**
   * @param type The resource type.
   * @param baseUrl The API URL.
   */
  public constructor(type: string, baseUrl: string) {
    this.type = type;
    this.baseUrl = baseUrl;
  }

  /**
   * Endpoint for the collection of resources of this type. Override if
   * your resource doesn't follow the standard `/{groupCode}/{type}`.
   *
   * @param groupCode The code of the group
   */
  protected collectionEndpoint(groupCode: string) {
    return `/${groupCode}/${this.type}`;
  }

  /**
   * Endpoint for a single resource of this type. Override if
   * your resource doesn't follow the standard:`
   * ```
   *  collectionEndpoint(groupCode)/{code}.
   * ```
   *
   * @param code The code of the resource
   * @param groupCode The code of the group
   */
  protected resourceEndpoint(code: string, groupCode: string) {
    return this.collectionEndpoint(groupCode) + `/${code}`;
  }

  /**
   * Override this method to add getters for inverse relationships of this resource.
   *
   * If a resource of type A has a one-to-one relationship to this resource but
   * this resource doesn't directly have the inverse relationship, by declaring
   * the inverse relatinship the resource object will behave as if teh inverse 
   * relationship was also present in the API. The loading of the related object,
   * however, can't be done using the `include` parameter of load actions, but
   * has to be done through a separate load action. It also works with external 
   * relationships.
   *
   *
   * @returns an object with the inverse relationship name as keys and, as values,
   * a descriptor object with entries `module` for the vuex module name that manages
   * the related resource and `field` for the name of the direct relationship from
   * the related resource to this resource.
   */
  protected inverseRelationships(): Record<string, { module: string; field: string }> {
    return {};
  }

  private getHttpClient(context: ActionContext<ResourcesState<T>, S>): AxiosInstance {
    return Axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${context.rootGetters['accessToken']}`
      }
    });
  }

  private async request(context: ActionContext<ResourcesState<T>, S>, url: string) {
    try {
      return await this.getHttpClient(context).get(url)
    } catch (error) {
      if ((error as AxiosError).code == "401" && (context.rootState as UserState).userId) {
        // Unauthorized. Try refreshing token.
        await context.dispatch("authorize");
        return await this.getHttpClient(context).get(url);
      }
      throw error;
    }
  }

  /**
   * Trigger `add` commit to the relevant modules for each resource given.
   *
   * If there are included external resources, then dispatch actions to load them. The
   * returned promise will resolve when these actions fulfill.
   *
   * @param included Included resources
   * @param commit Commit function
   */
  protected static async handleIncluded(
    included: ResourceObject[],
    group: string,
    commit: Commit,
    dispatch: Dispatch
  ) {
    // Here we commit all included resources and accumulate all external resources for later fetch.
    const external: Record<string, ExternalResourceObject[]> = {};
    included.forEach(resource => {
      if (!(resource as ExternalResourceObject).meta?.external) {
        // Standard included resource. Commit change!
        commit(resource.type + "/add", resource, { root: true });
      } else {
        // External included resource.
        if (!external[resource.type]) {
          external[resource.type] = [];
        }
        external[resource.type].push(resource as ExternalResourceObject);
      }
    });
    // Fetch external resources.
    const promises = Object.keys(external).map(name => {
      const ids = external[name].map(resource => resource.id).join(",");
      return dispatch(
        `${name}/loadList`,
        {
          group,
          filter: {
            id: ids
          }
        } as LoadListPayload,
        { root: true }
      );
    });

    await Promise.all(promises);
  }

  /**
   * Commits the results provided by AxiosResponse and then it eventually fetches
   * the external relationships.
   */
  protected async handleCollectionResponse(
    response: AxiosResponse<CollectionResponseInclude<T, ResourceObject>>,
    context: ActionContext<ResourcesState<T>, S>,
    group: string
  ) {
    const {commit, dispatch} = context;
    // Commit mutation(s).
    const result = response.data;
    commit("setList", result.data);
    commit("setNext", result.links.next);
    // Commit included resources.
    if (result.included) {
      await Resources.handleIncluded(result.included, group, commit, dispatch);
    }
  }
  /**
   * Handle error from the API.
   *
   * @param error The Network error.
   */
  protected static getKError(error: AxiosError<ErrorObject>) {
    if (error.response) {
      // Server returned error. Use code from server response.
      const apiError = error.response.data;
      // Check that the code is actually known.
      const code =
        apiError.code in KErrorCode
          ? (apiError.code as KErrorCode)
          : KErrorCode.UnknownServer;

      return new KError(code, apiError.title, error);
    } else if (error.request) {
      // Server didn't respond.
      return new KError(KErrorCode.ServerNoResponse, error.message, error);
    } else {
      // Request could not be prepared.
      return new KError(KErrorCode.IncorrectRequest, error.message, error);
    }
  }

  /**
   * Foreach relationship in main resource with linkage data, add a property of the same
   * name to the object with the value of the linked resource(s). This is done through a
   * getter that lazily loads related resources from the store.
   *
   * @param rootGetters Store getters object.
   * @param main ResourceObject.
   *
   * @return the main ResourceObject
   */
  protected relatedGetters(rootGetters: Record<string, Getter>, main: T): T {
    // Copy object so we don't modify the object in state.
    main = JSON.parse(JSON.stringify(main));
    
    // Add getters for relationships.
    if (main.relationships) {
      const relationships = Object.entries(main.relationships).filter(
        ([, value]) => value.data !== undefined
      );
      if (relationships.length > 0) {
        relationships.forEach(([name, value]) => {
          if (Array.isArray(value.data)) {
            Object.defineProperty(main, name, {
              get: function() {
                return (value.data as ResourceIdentifierObject[]).map(
                  resourceId =>
                    rootGetters[resourceId.type + "/one"](resourceId.id)
                );
              }
            });
          } else {
            Object.defineProperty(main, name, {
              get: function() {
                const resourceId = value.data as ResourceIdentifierObject;
                return rootGetters[resourceId.type + "/one"](resourceId.id);
              }
            });
          }
        });
      }
    }
    // Add getters for inverse relationships (only one-to-one).
    const inverses = this.inverseRelationships();
    Object.keys(inverses)
      .filter(name => !name.includes("."))
      .forEach(name => {
        Object.defineProperty(main, name, {
          get: function() {
            return rootGetters[inverses[name].module + "/find"]({
              [inverses[name].field]: main.id
            });
          }
        });
      });
    return main;
  }

  state = {
    resources: {},
    current: null,
    currentList: [],
    next: undefined
  } as ResourcesState<T>;

  getters = {
    /**
     * Gets a resource given its id.
     */
    one: (
      state: ResourcesState<T>,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: Record<string, Getter>
    ) => (id: string) =>
      state.resources[id]
        ? this.relatedGetters(rootGetters, state.resources[id])
        : null,
    /**
     * Gets the first resource meeting some criteria. Criteria is a map with 
     * field => value. 
     * 
     * If field is an attribute, the value is matched with attribute value.
     * If field is a relationship, the value is mathed against the related resource id.
     */
    find: (
      state: ResourcesState<T>,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: Record<string, Getter>
    ) => (conditions: Record<string, string>) => {
      const target = Object.values(state.resources).find((resource: ResourceObject) =>
        Object.entries(conditions).every(
          ([field, value]) => {
            if (resource.attributes?.[field]) {
              return resource.attributes[field] == value;
            }
            // Check that the relationship is defined and is to-one.
            else if (typeof resource.relationships?.[field].data == "object") {
              return (resource.relationships[field].data as ResourceIdentifierObject).id == value
            }
            return false;
          }
        )
      );
      return target ? this.relatedGetters(rootGetters, target) : null;
    },

    /**
     * Gets the current resource.
     */
    current: (
      state: ResourcesState<T>,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: Record<string, Getter>
    ) =>
      state.current != null
        ? this.relatedGetters(rootGetters, state.resources[state.current])
        : undefined,
    /**
     * Gets the current list of resources.
     */
    currentList: (
      state: ResourcesState<T>,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: Record<string, Getter>
    ) =>
      state.currentList
        .map(id => state.resources[id])
        .map(resource => this.relatedGetters(rootGetters, resource)),
    /**
     * Returns whether the current list has more resources to be fetched.
     */
    hasNext: (state: ResourcesState<T>) =>
      state.next === undefined ? undefined : state.next !== null
  };

  mutations = {
    /**
     * Update the current list of resources
     */
    setList(state: ResourcesState<T>, resources: T[]) {
      resources.forEach(resource => (state.resources[resource.id] = resource));
      state.currentList = resources.map(resource => resource.id);
    },
    /**
     * Update the current resource
     */
    setCurrent(state: ResourcesState<T>, resource: T) {
      state.resources[resource.id] = resource;
      state.current = resource.id;
    },
    /**
     * Add a resource to the dictionary without updating the current resource.
     */
    add(state: ResourcesState<T>, resource: T) {
      state.resources[resource.id] = resource;
    },
    /**
     * Update the next link.
     */
    setNext(state: ResourcesState<T>, next: string | null) {
      state.next = next;
    }
  };

  actions = {
    loadList: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: LoadListPayload
    ) => this.loadList(context, payload),
    loadNext: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: LoadNextPayload
    ) => this.loadNext(context, payload),
    load: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: LoadPayload
    ) => this.load(context, payload)
  };
  /**
   * Fetches the current list of resources.
   *
   * @param payload Configure the request by filtering the results, including related resources, including the current location, sorting.
   */
  protected async loadList(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadListPayload
  ) {
    // Build query string.
    const params = new URLSearchParams();
    if (payload.search) {
      params.set("filter[search]", payload.search);
    }
    if (payload.filter) {
      Object.entries(payload.filter).map(([field, value]) => {
        params.set(`filter[${field}]`, value);
      });
    }
    if (payload.location) {
      params.set(
        "geo-position",
        payload.location[0] + "," + payload.location[1]
      );
      if (!payload.sort) {
        payload.sort = "location";
      }
    }
    if (payload.sort) {
      params.set("sort", payload.sort);
    }

    if (payload.include) {
      params.set("include", payload.include);
    }
    let url = this.collectionEndpoint(payload.group);
    const query = params.toString();
    if (query.length > 0) url += "?" + query;
    // Call API
    try {
      const response = await this.request(context, url);
      await this.handleCollectionResponse(
        response,
        context,
        payload.group
      );
    } catch (error) {
      throw Resources.getKError(error as AxiosError);
    }
  }
  protected async loadNext(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadNextPayload
  ) {
    try {
      if (context.state.next === null) {
        // There are no more results.
        context.commit("setList", []);
        return;
      }
      if (context.state.next === undefined) {
        // We can't do the loadNext call yet, since we don't have any next link. A loadList action should be called first.
        throw new KError(
          KErrorCode.ScriptError,
          "Unexpected call to 'loadNext' resource action with undefined next link."
        );
      }
      const response = await this.request(context, context.state.next);

      await this.handleCollectionResponse(
        response,
        context,
        payload.group,
      );
    } catch (error) {
      throw Resources.getKError(error as AxiosError);
    }
  }
  /**
   * Fetches the current reaource.
   */
  protected async load(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadPayload
  ) {
    let url = this.resourceEndpoint(payload.code, payload.group);
    if (payload.include) {
      const params = new URLSearchParams();
      params.set("include", payload.include);
      url += "?" + params.toString();
    }
    // Call API
    try {
      const response = await this.request(context, url);
      // Commit mutation(s).
      const resource = response.data.data;
      context.commit("setCurrent", resource);
      if (response.data.included) {
        await Resources.handleIncluded(
          response.data.included,
          payload.group,
          context.commit,
          context.dispatch
        );
      }
    } catch (error) {
      throw Resources.getKError(error as AxiosError);
    }
  }

}
