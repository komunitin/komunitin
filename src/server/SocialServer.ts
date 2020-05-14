// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Model, belongsTo, hasMany, Server, Factory } from "miragejs";
import faker from "faker";

import { ContactNetworks } from "../components/SocialNetworks";
import KOptions from "../komunitin.json";
import ApiSerializer from "./ApiSerializer";

const urlSocial = KOptions.apis.social;

const contactTypes = Object.keys(ContactNetworks);

function fakeMarkdown(paragraphs: number): string {
  let text = "";
  for (let i = 0; i < paragraphs; i++) {
    const sentences = faker.random.number({ min: 2, max: 20 });
    for (let j = 0; j < sentences; j++) {
      let sentence = faker.lorem.sentence();
      if ((i + j) % 8 == 0 && faker.random.boolean()) {
        sentence = "*" + sentence + "*";
      }
      if ((i + j) % 10 == 0 && faker.random.boolean()) {
        sentence = "**" + sentence + "**";
      }
      text += sentence + " ";
    }
    text += "\n\n";
  }
  return text;
}

function fakeContactName(type: string) {
  switch (type) {
    case "whatsapp":
    case "phone":
      return faker.phone.phoneNumberFormat();
    case "telegram":
      return "@" + faker.internet.userName();
    default:
      return faker.internet.email();
  }
}

function fakeLocation() {
  return {
    name: faker.address.county(),
    type: "Point",
    coordinates: [faker.address.longitude(), faker.address.latitude()]
  };
}

function fakeAddress() {
  return {
    streetAddress: faker.address.streetAddress(),
    addressLocality: faker.address.city(),
    postalCode: faker.address.zipCode(),
    addressRegion: faker.address.county()
  };
}

interface Association {
  type: string;
  name: string;
  modelName: string;
}

/**
 * Object containing the properties to create a MirageJS server that mocks the
 * Komunitin Social API.
 */
export default {
  // Use Mirage JSONAPISerializer to serialize models defined here.
  serializers: {
    group: ApiSerializer.extend({
      links(group: any) {
        const links = {} as { [key: string]: { related: string } };
        (Object.values(group.associations) as Association[]).forEach(
          association => {
            links[association.name] = {
              related: urlSocial + "/" + group.code + "/" + association.name
            };
          }
        );
        return links;
      },
      shouldIncludeLinkageData(relationshipKey: string, model: any) {
        return (
          ApiSerializer.prototype.shouldIncludeLinkageData.apply(this, [
            relationshipKey,
            model
          ]) || relationshipKey == "contacts"
        );
      },
      selfLink: (group: any) => urlSocial + "/" + group.code
    }),
    member: ApiSerializer.extend({
      selfLink: (member: any) =>
        urlSocial + "/" + member.group.code + "/members/" + member.code
    }),
    contact: ApiSerializer,
    category: ApiSerializer.extend({
      selfLink: (category: any) =>
        urlSocial + "/" + category.group.code + "/categories/" + category.code
    }),
    offer: ApiSerializer.extend({
      selfLink: (offer: any) =>
        urlSocial + "/" + offer.group.code + "/offers/" + offer.code
    }),
    need: ApiSerializer.extend({
      selfLink: (need: any) =>
        urlSocial + "/" + need.group.code + "/needs/" + need.code
    })
  },
  models: {
    group: Model.extend({
      members: hasMany(),
      contacts: hasMany(),
      categories: hasMany(),
      offers: hasMany(),
      needs: hasMany()
    }),
    member: Model.extend({
      group: belongsTo(),
      contacts: hasMany()
    }),
    contact: Model,
    category: Model.extend({
      group: belongsTo()
    }),
    offer: Model.extend({
      category: belongsTo(),
      group: belongsTo(),
      member: belongsTo()
    }),
    need: Model.extend({
      category: belongsTo(),
      group: belongsTo(),
      member: belongsTo()
    })
  },
  factories: {
    group: Factory.extend({
      code: (i: number) => `GRP${i}`,
      name: (i: number) => `Group ${i}`,
      description: () => fakeMarkdown(4),
      image: () => faker.image.image(),
      website: () => faker.internet.url(),
      access: "public",
      location: () => fakeLocation(),
      created: () => faker.date.past().toJSON(),
      updated: () => faker.date.recent().toJSON()
    }),
    contact: Factory.extend({
      type: (i: number) => contactTypes[i % contactTypes.length],
      name: (i: number) =>
        fakeContactName(contactTypes[i % contactTypes.length]),
      created: () => faker.date.past().toJSON(),
      updated() {
        return this.created;
      }
    }),
    member: Factory.extend({
      code() {
        return faker.internet.userName((this as any).name);
      },
      access: "public",
      //type: "business",
      name: () => faker.name.findName(),
      description: () => fakeMarkdown(2),
      image: () => faker.image.avatar(),
      address: () => fakeAddress(),
      location: () => fakeLocation(),
      created: () => faker.date.past(),
      updated: () => faker.date.recent()
    }),
    category: Factory.extend({
      name: () => faker.commerce.department(),
      code() {
        return faker.helpers.slugify((this as any).name);
      },
      cpa: ["10", "11", "56"],
      description: () => faker.lorem.sentence(),
      icon: () => faker.image.image(),
      access: "public",
      created: () => faker.date.past(),
      updated() {
        return this.created;
      }
    }),
    offer: Factory.extend({
      name: () => faker.commerce.product(),
      content: () => fakeMarkdown(faker.random.number({ min: 1, max: 5 })),
      images: () =>
        Array.from({ length: faker.random.number({ min: 1, max: 5 }) }, () => {
          return {
            href: faker.image.food(),
            alt: faker.company.catchPhrase()
          };
        }),
      access: "public",
      expires: () => faker.date.future().toJSON(),
      created: () => faker.date.past().toJSON(),
      updated: () => faker.date.recent().toJSON()
    })
  },
  seeds(server: Server) {
    // Create groups.
    server.createList("group", 7).forEach(group => {
      // Create group contacts.
      const contacts = server.createList("contact", 4);
      group.update({ contacts });
      // Create categories.
      const categories = server.createList("category", 5, { group } as any);
      // Create group members
      const members = server.createList("member", 10, { group } as any);
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        // Create member contacts.
        const contacts = server.createList("contact", 4);
        member.update({ contacts });
        // Create member offers.
        const category = categories[i % categories.length];
        server.createList("offer", 3, {
          member,
          category,
          group
        } as any);
        // Create member needs only for some members.
        if (i % 4 == 0) {
          server.createList("need", i % 3, {
            member,
            category: categories[(i + 2) % categories.length],
            group
          } as any);
        }
        i++;
      }
    });
  },
  routes(server: Server) {
    // All groups
    server.get(urlSocial + "/groups", (schema: any) => {
      return schema.groups.all();
    });

    // Single group
    server.get(urlSocial + "/:code", (schema: any, request) => {
      return schema.groups.findBy({ code: request.params.code });
    });

    // Group categories.
    server.get(urlSocial + "/:code/categories", (schema: any, request) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return schema.categories.where({ group });
    });

    // Group offers.
    server.get(urlSocial + "/:code/offers", (schema: any, request) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return schema.offers.where({ group });
    });
  }
};
