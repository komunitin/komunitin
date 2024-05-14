

export const whereFilter = (filter: Record<string, string | string[]>) => {
  const where: Record<string, any> = {}
  for (const key in Object.keys(filter)) {
    if (filter[key]) {
      if (Array.isArray(filter[key])) {
        where[key] = {
          in: filter[key]
        }
      } else {
        where[key] = filter[key]
      }
    }
  }
  return where
}