// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Model, belongsTo, hasMany, Server, Factory } from "miragejs";
import faker from "faker";
import { filter } from "./ServerUtils"

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

function fakeImage(search = "", size = "800x600") {
  return `https://source.unsplash.com/${size}/?${search}`;
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
      shouldIncludeLinkageData(relationshipKey: string, model: any) {
        return (
          ApiSerializer.prototype.shouldIncludeLinkageData.apply(this, [
            relationshipKey,
            model
          ]) || relationshipKey == "contacts"
        );
      },
      selfLink: (member: any) =>
        urlSocial + "/" + member.group.code + "/members/" + member.code
    }),
    contact: ApiSerializer,
    category: ApiSerializer.extend({
      links(category: any) {
        return {
          offers: {
            related: `${urlSocial}/${category.group.code}/offers?filter[category]=${category.id}`
          },
          needs: {
            related: `${urlSocial}/${category.group.code}/needs?filter[category]=${category.id}`
          }
        };
      },
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
    }),
    user: ApiSerializer.extend({
      alwaysIncludeLinkageData: true,
      selfLink: () => urlSocial + "/users/me"
    })
  },
  models: {
    user: Model.extend({
      members: hasMany()
    }),
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
      group: belongsTo(),
      offers: hasMany(),
      needs: hasMany()
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
    user: Factory.extend({
      created: () => faker.date.past(),
      updated: () => faker.date.past()
    }),
    group: Factory.extend({
      code: (i: number) => `GRP${i}`,
      name: (i: number) => `Group ${i}`,
      description: () => fakeMarkdown(4),
      image: (i: number) => fakeImage(`group${i}`),
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
      image: (i: number) => fakeImage(`face-${i}`, "100x100"),
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
      icon: () => fakeImage("product"),
      access: "public",
      created: () => faker.date.past(),
      updated() {
        return this.created;
      }
    }),
    offer: Factory.extend({
      name: () => faker.commerce.product(),
      code() {
        return faker.helpers.slugify((this as any).name);
      },
      content: () => fakeMarkdown(faker.random.number({ min: 1, max: 5 })),
      images: (i: number) =>
        Array.from(
          { length: faker.random.number({ min: 1, max: 5 }) },
          (v: never, j: number) => {
            return {
              href: fakeImage(`product${i}-${j}`),
              alt: faker.company.catchPhrase()
            };
          }
        ),
      access: "public",
      expires: () => faker.date.future().toJSON(),
      created: () => faker.date.past().toJSON(),
      updated: () => faker.date.recent().toJSON()
    }),
    need: Factory.extend({
      content: () => fakeMarkdown(faker.random.number({min: 1, max: 2})),
      code() {
        return faker.helpers.slugify((this as any).content.substr(0, 10));
      },
      images: (i: number) => Array.from(
        // Often it's empty.
        { length: Math.max(faker.random.number({ min: -2, max: 4 }), 0) },
        (v: never, j: number) => {
          return {
            href: fakeImage(`need${i}-${j}`),
          };
        }
      ),
      access: "public",
      expires: () => faker.date.future().toJSON(),
      created: () => faker.date.past().toJSON(),
      updated: () => faker.date.recent().toJSON()
    })
  },
  seeds(server: Server) {
    faker.seed(2030);
    // Create groups.
    server.createList("group", 7).forEach((group, i) => {
      // Create group contacts.
      const contacts = server.createList("contact", 4);
      group.update({ contacts });
      // Only add data for the first two groups. Otherwise we spend a lot of
      // time in this function.
      if (i < 2) {
        // Create categories.
        const categories = server.createList("category", 5, { group } as any);
        // Create group members
        const members = server.createList("member", i == 0 ? 30 : 5, { group } as any);
        for (let j = 0; j < members.length; j++) {
          const member = members[j];
          // Create member contacts.
          const contacts = server.createList("contact", 4);
          member.update({ contacts });
          // Create member offers.
          const category = categories[j % categories.length];
          server.createList("offer", 3, {
            member,
            category,
            group
          } as any);
          // Create member needs only for some members.
          if (j % 4 == 0) {
            server.createList("need", (j % 3) + 1, {
              member,
              category: categories[j % categories.length],
              group
            } as any);
          }
        }
      }
    });
    // Create user.
    const member = (server.schema as any).members.first();
    server.create("user", { members: [member] } as any);
  },
  routes(server: Server) {
    // All groups
    server.get(urlSocial + "/groups", (schema: any, request) => {
      return filter(schema.groups.all(), request);
    });

    // Single group
    server.get(urlSocial + "/:code", (schema: any, request) => {
      return schema.groups.findBy({ code: request.params.code });
    });

    // Group categories.
    server.get(urlSocial + "/:code/categories", (schema: any, request) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return schema.categories.where({ groupId: group.id });
    });

    // Group offers.
    server.get(urlSocial + "/:code/offers", (schema: any, request: any) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return filter(schema.offers.where({ groupId: group.id }), request);
    });

    // Group offers.
    server.get(urlSocial + "/:code/needs", (schema: any, request: any) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return filter(schema.needs.where({ groupId: group.id }), request);
    });

    // Group members.
    server.get(urlSocial + "/:code/members", (schema: any, request: any) => {
      const group = schema.groups.findBy({ code: request.params.code });
      return filter(schema.members.where({ groupId: group.id }), request);
    });

    // Logged-in User
    server.get(urlSocial + "/users/me", (schema: any) => {
      return schema.users.first();
    });
  }
};
