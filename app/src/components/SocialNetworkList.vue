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
          <img :src="networkIcon(key)">
        </q-avatar>
      </q-item-section>
      <q-item-section v-if="network.name !== undefined">
        <q-item-label>{{ network.name }}</q-item-label>
        <q-item-label caption>
          {{ network.label }}
        </q-item-label>
      </q-item-section>
      <q-item-section v-else>
        <q-item-label>{{ network.label }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {SocialNetwork, ContactNetworks, ShareNetworks, getContactUrl, getNetworkIcon, getShareUrl} from "./SocialNetworks";

import { Contact } from "../store/model";

type NetworkNames = Record<string, { name?: string }>;

const CONTACT = "contact";
const SHARE = "share";

/**
 * Social network augmented with the identifier of the contact.
 */
interface DataNetwork extends SocialNetwork {
  name?: string;
}

export default defineComponent({
  name: "SocialNetworkList",
  props: {
    type: {
      type: String,
      default: SHARE,
      validator: (value: string) => [CONTACT, SHARE].includes(value)
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
        return Object.keys(ShareNetworks).reduce(
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
          ? ContactNetworks
          : ShareNetworks;
      // Return the array of networks with info merged from given "network" prop and static.
      return Object.keys(nets).reduce(
        (obj: { [key: string]: DataNetwork }, key: string) => {
          if (key in baseNetworks) {
            obj[key] = baseNetworks[key];
            // Contacts have "name", ShareNetworks no.
            if (nets[key].name !== undefined) {
              obj[key].name = nets[key].name;
            }
            if (obj[key].label && baseNetworks[key].translateLabel) {
              obj[key].label = this.$t(obj[key].label);
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
          ? getContactUrl(net, net.name ?? "")
          : getShareUrl(net, this.url, this.title, this.text);
      window.open(url, "_blank");
    },
    /**
     * Return the network icon file, 
     */
    networkIcon(key: string) {
      return getNetworkIcon(key)
    }
  }
});
</script>
