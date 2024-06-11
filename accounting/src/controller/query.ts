

export const whereFilter = (filter: Record<string, string | string[]>) => {
  const where: Record<string, any> = {}
  const fields = Object.keys(filter)
  for (const key of fields) {
    if (filter[key]) {
      const values = Array.isArray(filter[key]) ? filter[key] : (filter[key] as string).split(',')
      if (values.length > 1) {
        where[key] = {
          in: values
        }
      } else {
        where[key] = values[0]
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