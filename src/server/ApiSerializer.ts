// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONAPISerializer, Request } from "miragejs";
import { ResourceObject } from "src/store/model";

declare module "miragejs/serializer" {
  interface JSONAPISerializer {
    getResourceObjectForModel(model: any): any;
    serialize(object: any, request: Request): any;
  }
}

export default class ApiSerializer extends JSONAPISerializer {
  public static readonly DEFAULT_PAGE_SIZE = 20;

  /**
   * Include linkage data for ro-one relationships
   */
  shouldIncludeLinkageData(relationshipKey: string, model: any) {
    return model.associations[relationshipKey].type == "belongsTo" ;
  }
  /**
   * Add meta.count field to collection relationships.
   * Add self link.
   * Add external relationship fields.
   */
  getResourceObjectForModel(model: any) {
    const json = super.getResourceObjectForModel(model);
    model.associationKeys.forEach((key: string) => {
      const relationship = model[key];
      const relationshipKey = (this as any).keyForRelationship(key);
      
      const jsonRelationship = json.relationships[relationshipKey];
      // Add meta.count field.
      if ((this as any).isCollection(relationship)) {
        jsonRelationship.meta = {
          count: relationship.models.length
        }
      }
      // Add external relationship fields (only work for one-to-one relationships)
      if (this.isExternal(relationshipKey) && (this as any).isModel(relationship)) {
        jsonRelationship.data.external = true;
        jsonRelationship.data.href = this.getExternalRelationhipHref(relationshipKey, relationship);
      }
    });
    const serializer = (this as any).serializerFor(model.modelName);
    const url = serializer.selfLink(model);
    if (url !== undefined) {
      json.links = {
        self: serializer.selfLink(model)
      }
    }
    return json;
  }
  /**
   * Returns whether the relationship identified by given key is external.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected isExternal(key: string): boolean {
    return false;
  }
  /**
   * Returns the absolute URL identifying an external resource.
   * 
   * Implementations overriding `isExternal` must also override and implement this function.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getExternalRelationhipHref(key: string, relationship: any): string {
    throw new Error("Not implemented!");
  }
  /**
   * Self link for given model. Return undefined for not setting the link.
   */
  selfLink(): string | undefined {
    return undefined;
  }
  /**
   * Apply page[x] query params.
   * 
   * @param object The serialized json object, before pagination.
   * @param request The original (fake) request object
   */
  private paginate(json: any, request: Request) {
    // Apply page[after].
    let hasPrevious = false;
    const after = request.queryParams["page[after]"] as string | undefined;
    if (after) {
      const index = json.data.findIndex((elem: ResourceObject) => elem.id == after);
      if (index == -1) {
        throw new Error("Invalid after pagination cursor.");
      }
      hasPrevious = true;
      // Delete all elements until after the cursor.
      json.data.splice(0, index + 1);
    }
    // Apply page[before]
    const before = request.queryParams["page[before]"] as string | undefined;
    if (before) {
      const index = json.data.findIndex((elem: ResourceObject) => elem.id == before);
      if (index == -1) {
        throw new Error("Invalid before pagination cursor.");
      }
      json.data.splice(index);
    }

    // Apply page[size] (or default size).
    let size = ApiSerializer.DEFAULT_PAGE_SIZE;
    if (request.queryParams["page[size]"]) {
      size = parseInt(request.queryParams["page[size]"]);
    }
    const hasNext = json.data.length > size;
    // Delete all elements exceeding size.
    if (hasNext) {
      json.data.splice(size);
    }

    // Build pagination links
    json.links = {};
    if (hasNext) {
      const next = new URL(request.url);
      next.searchParams.set("page[after]", json.data[json.data.length -1].id);
      json.links.next = next.toString();
    } else {
      json.links.next = null;
    }

    if (hasPrevious) {
      const prev = new URL(request.url);
      prev.searchParams.set("page[before]", json.data[0].id);
      json.links.prev = prev.toString();
    } else {
      json.links.prev = null;
    }
  }

  /**
   * Add to collection responses.
  */
  serialize(object: any, request: Request) {
    const json = super.serialize(object, request);
    if (Array.isArray(json.data)) {
      json.meta = {
        count: json.data.length
      };
      this.paginate(json, request);
    }
    return json;
  }

  /**
   * Overwrite the default behavior with the identity.
   */
  keyForAttribute(key: string): string {
    return key;
  }
}