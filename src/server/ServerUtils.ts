/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Implements the filtering for a JSON:API request.
 * 
 * @param records 
 * @param request 
 */
export function filter(records: any, request: any) {
  // Poor man search.
  if (request.queryParams["filter[search]"]) {
    const fragment = request.queryParams["filter[search]"];
    records = records.filter((record: any) =>
      Object.values(record.attrs).some(
        (value: any) => value && value.toString().toLowerCase().includes(fragment.toLowerCase())
      )
    );
  }
  // Filter by field values
  const regex = /filter\[(.+)\]/;
  Object.entries(request.queryParams)
    .filter(([name, ]) => name != "filter[search]")
    .filter(([name, ]) => regex.test(name))
    .map(([name, value]) => ([(name.match(regex) as string[])[1], value]) as [string,string])
    .forEach(([name, value] ) => {
      const values = value.split(",");
      records = records.filter((record: any) => {
        if (record.associations[name]) {
          name = record.associations[name].identifier;
        }
        return values.includes(record[name])
      })
    });
    
  return records;
}