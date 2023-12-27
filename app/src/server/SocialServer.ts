// Mirage typings are not perfect and sometimes we must use any.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Model, belongsTo, hasMany, Server, Factory } from "miragejs";
import faker from "faker";
import { filter } from "./ServerUtils"

import { ContactNetworks } from "../components/SocialNetworks";
import { KOptions } from "../boot/koptions";
import ApiSerializer from "./ApiSerializer";
import { inflections } from "inflected"


const urlSocial = KOptions.url.social;
const urlAccounting = KOptions.url.accounting;

const contactTypes = Object.keys(ContactNetworks);

inflections("en", function (inflect) {
  inflect.irregular("userSettings", "userSettings")
})

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

function fakeCategoryIconName(i: number): string {
  const icons = ["accessibility_new", "accessible_forward", "account_balance", "build", "eco", "house", "agriculture", "hotel", "pedal_bike", "restaurant", "clean_hands"];
  return icons[i % icons.length];
}

function fakePrice(i:number): string {
  if (i % 2 == 0) {
    return "" + (i/100.0)
  } else {
    if (i % 4 == 1) {
      return "Request a quote";
    } else {
      return "Contact me!";
    }
  }
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
      selfLink: (group: any) => urlSocial + "/" + group.code,
      isExternal(relationshipKey: string) {
        return relationshipKey == "currency";
      },
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
        urlSocial + "/" + member.group.code + "/members/" + member.code,
      isExternal(relationshipKey: string) {
        return relationshipKey == "account";
      },
      links: (member: any) => {
        return {
          account: {
            related: `${urlAccounting}/${member.account.currency.code}/accounts/${member.account.code}`
          }
        }
      }
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
      selfLink: () => urlSocial + "/users/me",
      links(user: any) {
        const member = user.members.models[0];
        return {
          members: {
            related: `${urlSocial}/${member.group.code}/members/${member.code}` 
          }
        }
      }
    }),
    userSettings: ApiSerializer.extend({
      selfLink: () => urlSocial + "/users/me/settings"
    }),
  },
  models: {
    user: Model.extend({
      members: hasMany(),
      settings: belongsTo("userSettings")
    }),
    userSettings: Model.extend({
      user: belongsTo()
    }),
    group: Model.extend({
      members: hasMany(),
      contacts: hasMany(),
      categories: hasMany(),
      offers: hasMany(),
      needs: hasMany(),
      currency: belongsTo(),
    }),
    member: Model.extend({
      group: belongsTo(),
      contacts: hasMany(),
      account: belongsTo(),
      needs: hasMany(),
      offers: hasMany(),
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
      updated: () => faker.date.past(),
    }),
    userSettings: Factory.extend({
      language: "en-us",
      notifications: {
        myAccount: true,
        newNeeds: true,
        newOffers: true,
        newMembers: true
      }
    }),
    group: Factory.extend({
      code: (i: number) => `GRP${i}`,
      name: (i: number) => `Group ${i}`,
      description: () => fakeMarkdown(4),
      image: (i: number) => (i % 2 == 0) ? fakeImage(`group${i}`) : null,
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
      updated: () => faker.date.past().toJSON(),
    }),
    member: Factory.extend({
      code() {
        return faker.internet.userName((this as any).name);
      },
      access: "public",
      type: () => faker.random.arrayElement(["personal", "business", "public"]),
      name: () => faker.name.findName(),
      description: () => fakeMarkdown(2),
      image: (i: number) => (i % 3 == 0) ? null : fakeImage(`face-${i}`, "100x100"),
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
      cpa: (i: number) => ["" + i, "" + 0, "" + 0],
      description: () => faker.lorem.sentence(),
      icon: (i: number) => (i % 3 == 1) ? null : fakeCategoryIconName(i),
      access: "public",
      created: () => faker.date.past(),
      updated: () => faker.date.past(),
    }),
    offer: Factory.extend({
      name: () => faker.commerce.product(),
      code(i: number) {
        return faker.helpers.slugify((this as any).name) + i;
      },
      content: () => fakeMarkdown(faker.random.number({ min: 1, max: 3 })),
      price: () => fakePrice(faker.random.number({min: 1, max:1000})),
      images: (i: number) =>
        Array.from(
          { length: faker.random.number({ min: 0, max: 5 }) },
          (v: never, j: number) => fakeImage(`product${i}-${j}`),
        ),
      access: "public",
      state: "published",
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
        { length: Math.max(faker.random.number({ min: -2, max: 2 }), 0) },
        (v: never, j: number) => fakeImage(`need${i}-${j}`)
      ),
      access: "public",
      state: "published",
      expires: () => faker.date.future().toJSON(),
      created: () => faker.date.past().toJSON(),
      updated: () => faker.date.recent().toJSON()
    })
  },
  seeds(server: Server) {
    faker.seed(1);
    // Create groups.
    server.createList("group", 7).forEach((group, i) => {
      // Create group contacts.
      faker.seed(1);
      const contacts = server.createList("contact", 4);
      group.update({ contacts });
      // Only add data for the first group. Otherwise we spend a lot of
      // time in this function.
      if (i == 0) {
        // Create categories.
        faker.seed(2030);
        const categories = server.createList("category", 5, { group } as any);
        // Create group members
        faker.seed(1);
        const members = server.createList("member", 30, { group } as any);
        for (let j = 0; j < members.length; j++) {
          const member = members[j];
          // Create member contacts.
          faker.seed(1 + j);
          const contacts = server.createList("contact", 4);
          member.update({ contacts });
          // Create member offers and needs only for the first 10 members.
          if (j < 10) {
            const category = categories[j % categories.length];
            faker.seed(j);
            server.createList("offer", 3, {
              member,
              category,
              group
            } as any);
            // Create member needs only for some members.
            if (j % 3 == 0) {
              faker.seed(j);
              server.createList("need", (j % 3) + 1, {
                member,
                category: categories[j % categories.length],
                group
              } as any);
            }
          }
        }
      }
    });
    // Create user for the first member.
    const member = (server.schema as any).members.first();
    server.create("user", {
      members: [member],
      settings: server.create("userSettings")
    } as any);
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

    // Single member.
    server.get(urlSocial + "/:code/members/:member", (schema: any, request: any) => {
      return schema.members.findBy({ code: request.params.member });
    });

    // Single offer.
    server.get(urlSocial + "/:code/offers/:offer", (schema: any, request: any) => {
      return schema.offers.findBy({ code: request.params.offer });
    });

    // Create offer
    server.post(urlSocial + "/:code/offers", (schema: any, request: any) => {
      const body = JSON.parse(request.requestBody);
      const offer = {
        ...body.data.attributes,
        code: faker.helpers.slugify(body.data.attributes.name.substr(0, 10)),
        created: new Date().toJSON(),
        updated: new Date().toJSON(),
        groupId: schema.groups.findBy({ code: request.params.code }).id,
        memberId: body.data.relationships.member.data.id,
        categoryId: body.data.relationships.category.data.id,
      }
      
      return schema.offers.create(offer);
    })

    // Update offer
    server.patch(urlSocial + "/:code/offers/:offer", (schema: any, request: any) => {
      const body = JSON.parse(request.requestBody);
      const offer = schema.offers.findBy({ code: request.params.offer });
      offer.update({
        ...body.data.attributes,
        updated: new Date().toJSON(),
      })
      return offer;
    })

    // Delete offer
    server.delete(urlSocial + "/:code/offers/:offer", (schema: any, request: any) => {
      const offer = schema.offers.findBy({ code: request.params.offer });
      offer.destroy();
      return undefined as any
    })

    // Single need
    server.get(urlSocial + "/:code/needs/:need", (schema: any, request: any) => {
      return schema.needs.findBy({ code: request.params.need });
    });

    // Create need
    server.post(urlSocial + "/:code/needs", (schema: any, request: any) => {
      const body = JSON.parse(request.requestBody);
      const need = {
        ...body.data.attributes,
        code: faker.helpers.slugify(body.data.attributes.content.substr(0, 10)),
        created: new Date().toJSON(),
        updated: new Date().toJSON(),
        groupId: schema.groups.findBy({ code: request.params.code }).id,
        memberId: body.data.relationships.member.data.id,
        categoryId: body.data.relationships.category.data.id,
      }
      
      return schema.needs.create(need);
    })

    // Update need
    server.patch(urlSocial + "/:code/needs/:need", (schema: any, request: any) => {
      const body = JSON.parse(request.requestBody);
      const need = schema.needs.findBy({ code: request.params.need });
      need.update({
        ...body.data.attributes,
        updated: new Date().toJSON(),
      })
      return need;
    })

    // Delete need
    server.delete(urlSocial + "/:code/needs/:need", (schema: any, request: any) => {
      const need = schema.needs.findBy({ code: request.params.need });
      need.destroy();
      return undefined as any
    })

    // Logged-in User
    server.get(urlSocial + "/users/me", (schema: any) => {
      return schema.users.first();
    });

    // User settings
    server.get(urlSocial + "/users/me/settings", (schema: any) => {
      return schema.userSettings.first();
    });

    // Edit user settings
    server.patch(urlSocial + "/users/me/settings", (schema: any, request: any) => {
      const body = JSON.parse(request.requestBody);
      const settings = schema.userSettings.first();
      settings.update(body.data.attributes);
      return settings;
    });
  }
};
