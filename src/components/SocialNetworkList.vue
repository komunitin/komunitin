<template>
  <q-list>
    <q-item
      v-for="(network, key) in dataNetworks"
      :key="key"
      :ref="key"
      clickable
      @click="contact(key)"
    >
      <q-item-section avatar>
        <q-avatar size="lg">
          <img :src="`icons/contacts/${key}.svg`" />
        </q-avatar>
      </q-item-section>
      <q-item-section v-if="network.name !== undefined">
        <q-item-label>{{ network.name }}</q-item-label>
        <q-item-label caption>{{ network.label }}</q-item-label>
      </q-item-section>
      <q-item-section v-else>
        <q-item-label>{{ network.label }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script lang="ts">
import Vue from "vue";
import * as SocialNetworks from "./SocialNetworks";

import { Contact } from "../store/model";

type NetworkNames = Record<string, { name?: string }>;

const CONTACT = "contact";
const SHARE = "share";

interface DataNetwork {
  name?: string;
  pattern: string;
  label: string;
  translateLabel: boolean;
}

export default Vue.extend({
  name: "SocialNetworkList",
  props: {
    type: {
      type: String,
      default: SHARE,
      validator: value => [CONTACT, SHARE].includes(value)
    },
    /**
     * Required if type = contact.
     */
    contacts: {
      type: Array,
      default: undefined
    },
    url: {
      type: String,
      default: window?.location.href ?? ""
    },
    title: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    }
  },
  computed: {
    /**
     * From a list of contacts generate a map of social networks that will be 
     * used as the source of dataNetworks function.
     */
    networkNames(): NetworkNames {
      if (this.type === CONTACT) {
        return (this.contacts as Contact[]).reduce(
          (names: NetworkNames, contact: Contact) => {
            names[contact.attributes.type] = {
              name: contact.attributes.name
            };
            return names;
          },
          {}
        );
      } else {
        return Object.keys(SocialNetworks.ShareNetworks).reduce(
          (names: NetworkNames, network: string) => {
            names[network] = {}
            return names;
          }, {});
      }
    },
    /**
     * Create the map that is used in the template.
     */
    dataNetworks(): Record<string, DataNetwork> {
      // If parameter ommitted when type="share", include all networks.
      const nets = this.networkNames;

      const baseNetworks =
        this.type == CONTACT
          ? SocialNetworks.ContactNetworks
          : SocialNetworks.ShareNetworks;
      // Return the array of networks with info merged from given "network" prop and static.
      return Object.keys(nets).reduce(
        (obj: { [key: string]: DataNetwork }, key: string) => {
          if (key in baseNetworks) {
            obj[key] = baseNetworks[key];
            // Contacts have "name", ShareNetworks no.
            if (nets[key].name !== undefined) {
              obj[key].name = nets[key].name;
            }
          }
          return obj;
        },
        {}
      );
    }
  },
  methods: {
    /**
     * Opens the social network in a new window or tab.
     */
    contact(network: string) {
      const net = this.dataNetworks[network];
      const url =
        this.type == CONTACT
          ? SocialNetworks.getContactUrl(net, net.name ?? "")
          : SocialNetworks.getShareUrl(net, this.url, this.title, this.text);
      window.open(url, "_blank");
    }
  }
});
</script>
