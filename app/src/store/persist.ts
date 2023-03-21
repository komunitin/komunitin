import { Store } from "vuex"
import localForage from "localforage"
import { ResourceObject } from "./model"
import { cloneDeep, merge } from "lodash"
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


  return (store: Store<T>) => {
    // Restore state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = {}
    storage.iterate((value, key) => {
      const index = key.split('/');
      let current = state;
      // Create module tree structure until level -2.
      for (let i = 0; i < index.length - 2; i++) {
        if (current[index[i]] === undefined) {
          current[index[i]] = {};
        }
        current = current[index[i]]
      }
      // Do the level - 2
      if (index.length >= 2) {
        const id = index[index.length - 2]
        if (current[id] === undefined) {
          if (id === 'pages') {
            current[id] = []
          } else {
            current[id] = {}
          }
        }
        current = current[id]
      }
      // Finally do the assignment.
      const id = index[index.length - 1]
      if (current instanceof Array) {
        current[parseInt(id)] = value
      } else {
        current[id] = value
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
        const {page, ids} = value as {page: number, ids: string[]}
        save([...index, 'pages', page + ""], ids)
      } else {
        save([...index, op], value)
      }
    })
  }
}