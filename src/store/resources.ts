import { Module, ActionContext, Commit } from "vuex";
import {
  ResourceObject,
  CollectionResponseInclude,
  ResourceResponseInclude,
  ResourceIdentifierObject
} from "src/pages/groups/models/model";
import Axios, { AxiosInstance } from "axios";
import { getKError } from "src/services/Api/ApiResources";

interface ResourcesState<T extends ResourceObject> {
  resources: { [key: string]: T };
  current: string | null;
  currentList: string[];
}

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

export interface LoadPayload {
  code: string;
  group: string;
  include?: string;
}

export class Resources<T extends ResourceObject, S> implements Module<ResourcesState<T>, S> {
  namespaced = true;

  readonly type: string;
  protected readonly client: AxiosInstance;

  public constructor(type: string, baseUrl: string) {
    this.type = type;
    this.client = this.getHttpClient(baseUrl);
  }

  protected collectionEndpoint(groupCode: string) {
    return `/${groupCode}/${this.type}`;
  }

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

  protected handleIncluded(included: ResourceObject[], commit: Commit) {
    included.forEach(resource => commit(resource.type + "/add", resource, {root: true}));
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
    one: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) => (id: string) =>
      this.relatedGetters(rootGetters, state.resources[id]),
    current: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) =>
      state.current != null ? this.relatedGetters(rootGetters, state.resources[state.current]) : undefined,
    currentList: (state: ResourcesState<T>, _getters: unknown, _rootState: unknown, rootGetters: {[key: string]: (id: string) => ResourceObject}) =>
      state.currentList.map(id => state.resources[id]).map(resource => this.relatedGetters(rootGetters, resource))
  };

  mutations = {
    setList(state: ResourcesState<T>, resources: T[]) {
      resources.forEach(resource => (state.resources[resource.id] = resource));
      state.currentList = resources.map(resource => resource.id);
    },
    setCurrent(state: ResourcesState<T>, resource: T) {
      state.resources[resource.id] = resource;
      state.current = resource.id;
    },
    add(state: ResourcesState<T>, resource: T) {
      state.resources[resource.id] = resource;
    }
  };

  actions = {
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
        throw getKError(error);
      }
    },
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
        throw getKError(error);
      }
    }
  };
}
