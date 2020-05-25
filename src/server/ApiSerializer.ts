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
   */
  getResourceObjectForModel(model: any) {
    const json = super.getResourceObjectForModel(model);
    model.associationKeys.forEach((key: string) => {
      const relationship = model[key];
      const relationshipKey = (this as any).keyForRelationship(key);

      if ((this as any).isCollection(relationship)) {
        json.relationships[relationshipKey].meta = {
          count: relationship.models.length
        }
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
   * Self link for given model. Return undefined for not setting the link.
   */
  selfLink(): string | undefined {
    return undefined;
  }
  /**
   * 
   * @param object 
   * @param request 
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
      json.links.next = prev.toString();
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
}