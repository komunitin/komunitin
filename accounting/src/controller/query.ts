

export const whereFilter = (filter: Record<string, string | string[]>) => {
  const where: Record<string, any> = {}
  const fields = Object.keys(filter)
  for (const key of fields) {
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

export const includeRelations = (include: string[] | undefined) => {
  if (!include) {
    return undefined
  }
  return Object.fromEntries(include.map((relation) => [relation, true]))
}