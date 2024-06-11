import KError, { KErrorCode } from "src/KError";
import { Module, ActionContext, Commit, Dispatch } from "vuex";
import { cloneDeep } from "lodash-es";

import {
  CollectionResponseInclude,
  ResourceIdentifierObject,
  ResourceObject,
  ExternalResourceObject,
  ErrorResponse
} from "src/store/model";

export interface ResourcesState<T extends ResourceObject> {
  /**
   * Dictionary of resources indexed by id.
   */
  resources: { [id: string]: T };
  /**
   * Array of pages. Each element is a page represented by an array of resource Id's.
   */
  pages: {[key: string]: string[][]}
  /**
   * Id of current resource.
   */
  currentId: string | null;
  /**
   * The url of the next page. null means no next page, undefined means unknown.
   */
  next: string | null | undefined;
  /**
   * The index of the current page. Note that currentList = [pages][currentQueryKey][currentPage].
   */
  currentPage: number | null;
  /**
   * The cache key for this list.
   */
  currentQueryKey: string | null;
}
export interface CreatePayload<T extends ResourceObject> {
  /**
   * The group where the records belong to.
   */
  group: string;

  /**
   * The resource
   */
  resource: T;
}

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface UpdatePayload<T extends ResourceObject> {
  /**
   * The resource code.
   */
  code: string
  /**
   * The group where the record belongs to.
   */
  group: string;
  /**
   * The updated fields for the resource.
   */
  resource: DeepPartial<T> & ResourceIdentifierObject
  /**
   * Array of resources to be updated alongside the main resource.
   */
  included?: (DeepPartial<ResourceObject> & ResourceIdentifierObject)[]
}

export interface DeletePayload {
  /**
   * The resource code.
   */
  code: string
  /**
   * The group where the record belongs to.
   */
  group: string;
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
  filter?: { [field: string]: string | string[] };
  /**
   * Sort the results using this field.
   */
  sort?: string;
  /**
   * Inlude related resources.
   */
  include?: string;
  /**
   * Updates current page and page set.
   * 
   * Set to false in calls to load auxiliar resources (not the current main list).
   */
  onlyResources?: boolean
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
   * the inverse relatinship the resource object will behave as if the inverse 
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

  private async request(context: ActionContext<ResourcesState<T>, S>, url: string, method?: "get"|"post"|"patch"|"delete", data?: object) {
    if (method == undefined) {
      method = "get";
    }
    // Resolve URL. Usually we're given relative urls except for the case when retreiving
    // the next page of a list, where we're given the absolute url directly from the API.
    url = url.startsWith("http") ? url : this.baseUrl + url;

    const request = async () => fetch(url, {
      method: method?.toUpperCase() ?? "GET",
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${context.rootGetters['accessToken']}`
      }
    })
    
    try {
      let response = await request()
      if (!response.ok && response.status == 401) {
        // Unauthorized. Refresh token and retry
        await context.dispatch("authorize", null, {root: true})
        response = await request()
      }
      await this.checkResponse(response)
      // No content
      if (response.status == 204) {
        return null
      } else {
        const json = await response.json()
        return json
      }
    } catch (error) {
      throw KError.getKError(error);
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
        commit(resource.type + "/addResource", resource, { root: true });
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
      const ids = external[name].map(resource => resource.id);
      return dispatch(
        `${name}/loadList`,
        {
          group,
          filter: {
            id: ids
          },
          onlyResources: true
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
    data: CollectionResponseInclude<T, ResourceObject>,
    context: ActionContext<ResourcesState<T>, S>,
    group: string,
    onlyResources?: boolean
  ) {
    const {commit, dispatch} = context;
    
    // Commit included resources.
    if (data.included) {
      await Resources.handleIncluded(data.included, group, commit, dispatch);
    }

    // Commit mutation(s) after commiting included and eventualy fetched external resources.
    if (!onlyResources) {
      commit("next", data.links.next)
      this.setCurrentPageResources(context, data.data)
    } else {
      commit("addResources", data.data)
    }
    
  }
  /**
   * Handle error from the API.
   *
   * @param error The Network error.
   */
  protected async checkResponse(response: Response) {
    if (!response.ok) {
      const data = await response.json() as ErrorResponse
      // Check that the code is actually known.
      const serverCode = data.errors?.[0]?.code
      const title = data.errors?.[0]?.title
      // check if serverCode is in enum KErrorCode:
      const code = (serverCode && serverCode in KErrorCode) ? serverCode as KErrorCode : KErrorCode.UnknownServer
      throw new KError(code, title);
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
                const items = (value.data as ResourceIdentifierObject[]).map(
                  resourceId =>
                    rootGetters[resourceId.type + "/one"](resourceId.id) as ResourceObject | null
                );
                // Return either all or no objects.
                return items.includes(null) ? null : items;
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
    pages: {},
    currentId: null,
    next: undefined,
    currentPage: null,
    currentQueryKey: null
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
      const targets = Object.values(state.resources).filter((resource: ResourceObject) =>
        Object.entries(conditions).every(
          ([field, value]) => {
            if (resource.attributes?.[field]) {
              return resource.attributes[field] == value;
            }
            // Check that the relationship is defined and is to-one.
            else if (typeof resource.relationships?.[field]?.data == "object") {
              return (resource.relationships[field].data as ResourceIdentifierObject).id == value
            }
            return false;
          }
        )
      );
      // In the improbable case we have more than one resource meeting the criteria, 
      // we return the last one. This may help in cases where this function is used
      // to find inverse one-to-one relationships that just changed, because the Object.values()
      // order is the insertion order so we'll get the most updated object.
      return targets.length > 0 ? this.relatedGetters(rootGetters, targets.pop() as T) : null;
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
      state.currentId != null
        ? this.relatedGetters(rootGetters, state.resources[state.currentId])
        : undefined,
    /**
     * Gets the current list of resources.
     */
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    currentList: (state: ResourcesState<T>, getters: any) => {
      if (state.currentPage !== null) {
        return getters.page(state.currentPage)
      } else {
        return undefined
      }
    },

    page: (
      state: ResourcesState<T>,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: Record<string, Getter>
    ) => (index: number) => {
      if (state.currentQueryKey !== null && state.pages[state.currentQueryKey] && state.pages[state.currentQueryKey][index]) {
        return state.pages[state.currentQueryKey][index]
          .map(id => state.resources[id])
          .map(resource => this.relatedGetters(rootGetters, resource))
      } else {
        return undefined;
      }
    },
       
    /**
     * Returns whether the current list has more resources to be fetched, or undefined if not known.
     */
    hasNext: (state: ResourcesState<T>) =>
      state.next === undefined ? undefined : state.next !== null
  };

  mutations = {
    /**
     * Update the current list of resources
     */
    setPageIds: (state: ResourcesState<T>, {key, page, ids}: {key: string, page: number, ids: string[]}) => {
      if (state.pages[key] === undefined) {
        state.pages[key] = []
      }
      state.pages[key][page] = ids;
    },
    /**
     * Add a resource to the dictionary without updating the current resource.
     */
    addResource: (state: ResourcesState<T>, resource: T) => {
      state.resources[resource.id] = resource
    },
    /**
     * Add the given resources to the resource list, without modifying current resource pointers.
     */
    addResources: (state: ResourcesState<T>, resources: T[]) => {
      resources.forEach(resource => {
        state.resources[resource.id] = resource
      });
    },
    /**
     * Removes resource from list.
     */
    removeResource: (state: ResourcesState<T>, id: string) => {
      delete state.resources[id]
    },
    /**
     * Update the current resource pointer.
     */
    currentId: (state: ResourcesState<T>, id: string|null) => {
      state.currentId = id;
    },
    /**
     * Update the next link.
     */
    next(state: ResourcesState<T>, next: string | null | undefined) {
      state.next = next;
    },
    /**
     * Update the current page index.
     */
    currentPage(state: ResourcesState<T>, index: number | null) {
      state.currentPage = index
    },
    /**
     * Update the current query key.
     */
    currentQueryKey(state: ResourcesState<T>, key: string) {
      state.currentQueryKey = key
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
    ) => this.load(context, payload),
    create: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: CreatePayload<T>
    ) => this.create(context, payload),
    update: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: UpdatePayload<T>
    ) => this.update(context, payload),
    delete: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: DeletePayload
    ) => this.delete(context, payload),
    setCurrent: (
      context: ActionContext<ResourcesState<T>, S>,
      payload: T
    ) => this.setCurrent(context, payload)
  };

  /**
   * Creates the API query string for this list filters.
   */
  protected buildQuery(payload: LoadListPayload): string {
    // Build query string.
    const params = new URLSearchParams();
    if (payload.search) {
      params.set("filter[search]", payload.search);
    }
    if (payload.filter) {
      Object.entries(payload.filter).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          value = value.join(",");
        }
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
    return params.toString()
  }

  /**
   * Creates a string that identifies this list filters for caching purposes.
   */
  protected buildQueryKey(payload: LoadListPayload): string {
    const params = new URLSearchParams()
    if (payload.search) {
      params.set("search", payload.search)
    }
    if (payload.filter) {
      Object.entries(payload.filter).map(([field, value]) => {
        if (Array.isArray(value)) {
          value = value.join(",");
        }
        params.set(`filter[${field}]`, value);
      });
    }
    if (payload.sort) {
      params.set("sort", payload.sort);
    }
    return params.toString()
  }

  /**
   * Fetches the current list of resources.
   *
   * @param payload Configure the request by filtering the results, including related resources, including the current location, sorting.
   */
  protected async loadList(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadListPayload
  ) {
    // Initialize the state to the first page.
    if (!payload.onlyResources) {
      context.commit("currentQueryKey", this.buildQueryKey(payload))
      context.commit("currentPage", 0)
      context.commit("next", undefined)
    }
    
    // At this point the data may already be cached and hence available to the UI. 
    // However we revalidate the data by doing the request.

    let url = this.collectionEndpoint(payload.group);
    const query = this.buildQuery(payload);
    if (query.length > 0) url += "?" + query;
    // Call API
    try {
      const data = await this.request(context, url);
      await this.handleCollectionResponse(
        data,
        context,
        payload.group,
        payload.onlyResources
      );
    } catch (error) {
      throw KError.getKError(error);
    }
  }
  protected async loadNext(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadNextPayload
  ) {
    try {
      if (context.state.next === undefined || context.state.currentPage === null || context.state.currentQueryKey == null) {
        throw new KError(
          KErrorCode.ScriptError,
          "Unexpected call to 'loadNext' resource action before calling to loadList."
        );
      }
      // Increase current page number.
      const page = context.state.currentPage + 1;
      context.commit("currentPage", page)

      // At this point the data may be already cached and available for the UI. We however 
      // revalidate that by calling the endpoint.

      // Well, if the endpoint is null it means that there's no next page.
      if (context.state.next === null) {
        context.commit("setPageIds", {key: context.state.currentQueryKey, page, ids:[]});
        return;
      }
      
      // Perform the request.
      const data = await this.request(context, context.state.next);
      await this.handleCollectionResponse(
        data,
        context,
        payload.group,
      );
    } catch (error) {
      throw KError.getKError(error);
    }
  }
  protected loadCached (
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadPayload
  ) {
    let id = null
    // transaction code is the resource id.
    if (context.state.resources[payload.code]) {
      id = payload.code
    } else {
    // in other resources the code is an attribute.
      const cached = context.getters['find']({
        code: payload.code,
      })
      if (cached) {
        id = cached.id
      }
    }
    context.commit("currentId", id)
  }
  /**
   * Fetches the current reaource.
   */
  protected async load(
    context: ActionContext<ResourcesState<T>, S>,
    payload: LoadPayload
  ) {
    // First, try to find the required resource in cache so we can render
    // some content before hitting the API.
    this.loadCached(context, payload)
    
    // Fetch (or revalidate) the content.
    let url = this.resourceEndpoint(payload.code, payload.group);
    if (payload.include) {
      const params = new URLSearchParams();
      params.set("include", payload.include);
      url += "?" + params.toString();
    }
    // Call API
    try {
      const data = await this.request(context, url);
      // Commit mutation(s).
      this.setCurrent(context, data.data)
      if (data.included) {
        await Resources.handleIncluded(
          data.included,
          payload.group,
          context.commit,
          context.dispatch
        );
      }
    } catch (error) {
      throw KError.getKError(error);
    }
  }
  /**
   * Creates a resource by posting the given resource to the API.
   * The response is updated to the current resource.
   */
  protected async create(
    context: ActionContext<ResourcesState<T>, S>,
    payload: CreatePayload<T>
  ) {
    const url = this.collectionEndpoint(payload.group)
    const resource = payload.resource;
    const body = {data: resource};
    try {
      const data = await this.request(context, url, "post", body)
      const resource = data.data
      this.setCurrent(context, resource)
    } catch (error) {
      throw KError.getKError(error);
    }
    
  }
  /**
   * Updates a resource by patching the given resource to the API.
   * The response is updated in the current resource.
   */
  protected async update(
    context: ActionContext<ResourcesState<T>, S>,
    payload: UpdatePayload<T>
  ) {
    const url = this.resourceEndpoint(payload.code, payload.group);
    const resource = payload.resource;
    const body = {data: resource, ...{included: payload.included}};
    try {
      const data = await this.request(context, url, "patch", body) 
      const resource = data.data
      this.setCurrent(context, resource)
    } catch (error) {
      throw KError.getKError(error);
    }
  }

  /**
   * Deletes a resource by calling the API. The resource is removed from the store, 
   * and if it was the current resource, then it is unset.
   */
  protected async delete(
    context: ActionContext<ResourcesState<T>, S>,
    payload: DeletePayload
  ) {
    const resource = context.getters.find({code: payload.code})
    const id = resource.id
    const url = this.resourceEndpoint(payload.code, payload.group)
    try {
      await this.request(context, url, "delete")
      // Remove from current pointer.
      if (context.state.currentId == id) {
        context.commit("currentId", null)
      }
      // Remove from pages.
      for (const key in context.state.pages) {
        const pages = context.state.pages[key]
        let afterDelete = false
        for (let i = 0; i < pages.length; i++) {
          // Remove the id from the page
          if (pages[i].includes(id)) {
            pages[i] = pages[i].filter(rid => rid != id)
            afterDelete = true
          }
          // From the altered page onwards, shift one id to the left.
          if (afterDelete) {
            if (i < pages.length - 1 && pages[i+1].length > 0) {
              pages[i].push(pages[i+1].shift() as string)
            }
            context.commit("setPageIds", {key, page: i, ids: pages[i]})
          }
        }
      }
      // Remove from store.
      context.commit("removeResource", id)
    } catch (error) {
      throw KError.getKError(error);
    }  
  }

  /**
   * Sets the current resource. Use this action when setting a resource created 
   * from the client and not fetched from the API, or internally from other actions.
   */
  protected setCurrent(context: ActionContext<ResourcesState<T>, S>, resource: T) {
    context.commit("addResource", this.updatedResource(context.state, resource))
    context.commit("currentId", resource.id)
  }

  /**
   * Use internally from other actions when adding new resources and updating the page ids list. 
   */
  protected setCurrentPageResources(context: ActionContext<ResourcesState<T>, S>, resources: T[]) {
    context.commit("addResources", this.updatedResources(context.state, resources))
    context.commit("setPageIds", {key: context.state.currentQueryKey, page: context.state.currentPage, ids: resources.map(resource => resource.id)})
  }
  
  /**
   * Array version of updatedResource().
   */
  protected updatedResources(state: ResourcesState<T>, resources: T[]) {
    return resources.map((resource) => this.updatedResource(state, resource))
  }
  /**
   * If the resource already exists, it will merge the new with the old object.
   * Note: this architecture may be buggy if an update happens to delete some
   * object property, but so far this does not seem to be a problem.
   */
  protected updatedResource(state: ResourcesState<T>, resource: T) {
    if (state.resources[resource.id] === undefined) {
      return resource
    } else {
      // We're merging the existing object with the new one, but only on the
      // first level. This means that we're just not losing the included loaded
      // relations while overwriting all attributes.
      return {
        ...cloneDeep(state.resources[resource.id]),
        ...resource
      }
    }
  }

}
