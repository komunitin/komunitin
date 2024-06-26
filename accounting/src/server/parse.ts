import {matchedData, validationResult} from "express-validator"
import {Request} from "express"
import {badRequest} from "../utils/error"

const mount = (data: Record<string, any>, included: Record<string, any>[] | undefined, depth = 0) => {
  if (depth > 3) {
    throw badRequest("Too deep relationships")
  }

  // build relationships
  let relationships: Record<string, any> = {}
  if (data.relationships) {
    Object.entries(data.relationships).forEach(([key, value]: [string, any]) => {
      if (!value.data) {
        throw badRequest("Relationships must have a 'data' key")
      }
      const includedResource = (resourceId: {id: string, type: string}) => {
        const resource = included?.find(resource => resource.id === resourceId.id && resource.type === resourceId.type)
        return resource ? mount(resource, included, depth + 1) : resourceId.id
      }
      const includedResources = (resourceIds: {id: string, type: string}[]) => {
        return resourceIds.map(resourceId => includedResource(resourceId))
      }
      relationships[key] = Array.isArray(value.data) ? includedResources(value.data) : includedResource(value.data)
    })
  }

  const resource = {
    ...data.attributes,
    ...relationships,
    // overwrite undefined id and type in attributes from validation
    id: data.id,
    type: data.type,
  }

  return resource
}

/**
 * Returns an object from a validated json:api input resource object.
 * Sets the id from the route, sets the attributes as top-level keys and
 * sets the relationships as loaded objects or just identifiers using
 * the relationship name as key.
 * 
 * @return The data object with 
 */
export const input = (req: Request) => {
  // Get validated input from express-validator.
  validationResult(req).throw()
  const input = matchedData(req)
  if (!input.data) {
    throw badRequest("Missing data")
  }
  const data = mount(input.data, input.included)
  // Check id.
  if (req.params.id) {
    if (data.id && req.params.id !== data.id) {
      throw badRequest("Route 'id' does not match with resource 'id")
    }
    data.id = req.params.id
  }

  return data
}