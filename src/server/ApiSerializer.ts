// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONAPISerializer } from "miragejs";

declare module "miragejs/serializer" {
  interface JSONAPISerializer {
    getResourceObjectForModel(model: any): any;
    serialize(object: any, request: any): any;
  }
}

export default class ApiSerializer extends JSONAPISerializer {
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
   * Add to collection responses.
  */
  serialize(object: any, request: any) {
    const json = super.serialize(object, request);
    if (Array.isArray(json.data)) {
      json.meta = {
        count: json.data.length
      }
    }
    return json;
  }
}