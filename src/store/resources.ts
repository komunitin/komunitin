import { Module, ActionContext, Commit } from "vuex";
import {
  ResourceObject,
  CollectionResponseInclude,
  ResourceResponseInclude,
  ResourceIdentifierObject,
  ErrorObject
} from "src/pages/groups/models/model";
import Axios, { AxiosInstance, AxiosError } from "axios";
import KError, { KErrorCode } from "src/KError";

interface ResourcesState<T extends ResourceObject> {
  /**
   * Dictionary of resources indexed by id.
   */
  resources: { [id: string]: T };
  /**
   * Id of current resource.
   */
  current: string | null;
  /**
   * Array of ids of current list of resources.
   */
  currentList: string[];
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
 * Flexible Vuex Module used to retrieve, store and provide resources fetched from the
 * Komunitin Apis. The implementation is generic for any resource thanks to the JSONAPI
 * spec.
 * 
 * Getters:
 * - `current`: Gives the current resource.
 * - `currentList`: Gives the cirrent list of resources.
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
  protected readonly client: AxiosInstance;

  /**
   * @param type The resource type.
   * @param baseUrl The API URL.
   */
  public constructor(type: string, baseUrl: string) {
    this.type = type;
    this.client = this.getHttpClient(baseUrl);
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

  private getHttpClient(baseUrl: string): AxiosInstance {
    return Axios.create({
      baseURL: baseUrl,
      withCredentials: false,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json"
      }
    });
  }

  /**
   * Trigger `add` commit to the relevant modules for each resource given.
   * 
   * @param included Included resources
   * @param commit Commit function
   */
  protected handleIncluded(included: ResourceObject[], commit: Commit) {
    included.forEach(resource => commit(resource.type + "/add", resource, {root: true}));
  }

  /**
   * Handle error from the API.
   * 
   * @param error The Network error.
   */
  protected getKError(error: AxiosError<ErrorObject>) {
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
   * @param main Resource Object.
   */
  protected relatedGetters(rootGetters: {[key: string]: (id: string) => ResourceObject}, main: ResourceObject) {
    if (main.relationships) {
      const relationships = Object.entries(main.relationships)
        .filter(([,value]) => value.data !== undefined);
      if (relationships.length > 0) {
        // Copy object so we don't modify the object in state.
        main = JSON.parse(JSON.stringify(main));
        relationships.forEach(([name, value]) => {
          if (Array.isArray(value.data)) {
            Object.defineProperty(main, name, {
              get: function() {
                return (value.data as ResourceIdentifierObject[])
                  .map(resourceId => rootGetters[resourceId.type + "/one"](resourceId.id));
              }
            });
          }
          else {
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
    return main;
  }

  state = {
    resources: {},
    current: null,
    currentList: []
  };

  getters = {
    /**
     * Gets a resource given its id.
     */
    one: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) => (id: string) =>
      this.relatedGetters(rootGetters, state.resources[id]),
    /**
     * Gets the current resource.
     */
    current: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) =>
      state.current != null ? this.relatedGetters(rootGetters, state.resources[state.current]) : undefined,
    /**
     * Gets the current list of resources.
     */
    currentList: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) =>
      state.currentList.map(id => state.resources[id]).map(resource => this.relatedGetters(rootGetters, resource))
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
    }
  };

  actions = {
    /**
     * Fetches the current list of resources.
     * 
     * @param payload Configure the request by filtering the results, including related resources, including the current location, sorting.
     */
    loadList: async (
      { commit }: ActionContext<ResourcesState<T>, S>,
      payload: LoadListPayload
    ) => {
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
        const response = await this.client.get<CollectionResponseInclude<T, ResourceObject>>(url);
        // Commit mutation(s).
        const resources = response.data.data;
        commit("setList", resources);
        if (response.data.included) {
          this.handleIncluded(response.data.included, commit);
        }
      } catch (error) {
        throw this.getKError(error);
      }
    },
    /**
     * Fetches the current reaource.
     */
    load: async (
      { commit }: ActionContext<ResourcesState<T>, S>,
      payload: LoadPayload
    ) => {
      let url = this.resourceEndpoint(payload.code, payload.group);
      if (payload.include) {
        const params = new URLSearchParams();
        params.set("include", payload.include);
        url += "?" + params.toString();
      }
      // Call API
      try {
        const response = await this.client.get<ResourceResponseInclude<T, ResourceObject>>(url);
        // Commit mutation(s).
        const resource = response.data.data;
        commit("setCurrent", resource);
        if (response.data.included) {
          this.handleIncluded(response.data.included, commit);
        }
      } catch (error) {
        throw this.getKError(error);
      }
    }
  };
}
