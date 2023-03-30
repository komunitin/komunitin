import { Store } from "vuex"
import localForage from "localforage"
import { ResourceObject } from "./model"
import { cloneDeep, merge } from "lodash-es"
import { toRaw } from "vue"

/**
 * Automatically update the state into persisten storage in every commit and restore the
 * state when executing this function at init.
 * 
 * In order for this plugin to properly work, the commit name must be the same as the state 
 * property, except for some special commits: addResources, addResource and setPageIds.
 * 
 * @param name The unique key for this database.
 * @returns Vuex plugin.
 */
export default function createPersistPlugin<T>(name: string) {
  
  const storage = localForage.createInstance({name})

  // Is this key a page ids value? /pages/key/index
  const isPage = (index: string[]) => index.length >= 3 && index[index.length-3] == 'pages'

  // Helper function to set the value in the proper place on the state tree.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildState = (state: any, index: string[], value: any, end: number = index.length) => {
    let current = state;
    for (let i = 0; i < end - 1; i++) {
      if (current[index[i]] === undefined) {
        current[index[i]] = {};
      }
      current = current[index[i]]
    }
    // last iteration set value instead of {}
    current[index[end - 1]] = value

    return value
  }


  return (store: Store<T>) => {
    // Restore state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = {}
    storage.iterate((value, key) => {
      const index = key.split('/');
      if (isPage(index)) {
        const current = buildState(state, index, [], index.length - 1)
        current[parseInt(index[index.length - 1])] = value
      } else {
        buildState(state, index, value)
      }
    }).then(() => {
      store.replaceState(merge(state, store.state))
    })

    // Subscribe to mutations
    store.subscribe(({type, payload}) => {
      // Sometimes we get reactive objects here that are not being able to be stored by localForage.
      // The cloneDeep ensures no reactivity in the object hierarchy.
      const value = cloneDeep(payload)

      const parts = type.split("/")
      const index = parts.slice(0, parts.length - 1)
      const op = parts[parts.length - 1]
      // setItem is asynchronous but we don't wait for the result (or error).
      const save = (i: string[], item: unknown) => storage.setItem(i.join('/'), item)
      if (op == 'addResources') {
        const resources = value as ResourceObject[]
        resources.forEach(resource => save([...index, 'resources', resource.id], toRaw(resource)))
      } else if (op == 'addResource') {
        const resource = value as ResourceObject
        save([...index, 'resources', resource.id], resource)
      } else if (op == 'setPageIds') {
        const {key, page, ids} = value as {key: string, page: number, ids: string[]}
        save([...index, 'pages', key, page + ""], ids)
      } else {
        save([...index, op], value)
      }
    })
  }
}