import localForage from "localforage"

export default  {
  has: async (key: string): Promise<boolean> => (await localForage.getItem(key)) !== null,
  getItem: async (key: string) => {
    const value = await localForage.getItem<string>(key)
    return value === null ? null : JSON.parse(value)
  },
  remove: async (key: string) => await localForage.removeItem(key),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: async (key: string, value: any) => await localForage.setItem(key, JSON.stringify(value)),
}