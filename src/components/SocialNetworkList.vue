<template>
  <q-list>
    <q-item v-for="(network, key) in dataNetworks" :key="key" :ref="key" clickable @click="contact(key)">
      <q-item-section avatar>
        <q-avatar size="lg">
          <img :src="`statics/icons/contacts/${key}.svg`" />
        </q-avatar>
      </q-item-section>
      <q-item-section v-if="network.name !== undefined">
        <q-item-label>{{network.name}}</q-item-label>
        <q-item-label caption>{{ network.label }}</q-item-label>
      </q-item-section>
      <q-item-section v-else>
          <q-item-label>{{network.label}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script lang="ts">
import Vue from 'vue';
import * as SocialNetworks from './SocialNetworks';

const CONTACT = "contact";
const SHARE = "share";

interface DataNetwork {
  name?: string,
  pattern: string,
  label: string,
  translateLabel: boolean
};

export default Vue.extend({
  name: "SocialNetworkList",
  props : {
    type: {
      type: String,
      default: SHARE,
      validator: (value) => [CONTACT, SHARE].includes(value)
    },
    networks: {
      type: Object,
      default: () => {return {}}
    },
    url: {
      type: String,
      default: window?.location.href ?? ''
    },
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    }
  },
  computed: {
    dataNetworks(): {[key: string]: DataNetwork} {
      // If parameter ommitted when type="share", include all networks.
      const nets = (this.type === CONTACT || Object.keys(this.networks).length > 0) ?
        this.networks : SocialNetworks.ShareNetworks;
      const baseNetworks = (this.type == CONTACT) ? SocialNetworks.ContactNetworks : SocialNetworks.ShareNetworks;
      // Return the array of networks with info merged from given "network" prop and static.
      return Object.keys(nets)
        .reduce((obj: {[key: string]: DataNetwork}, key: string) => {
          if (key in baseNetworks) {
            obj[key] = baseNetworks[key];
            if (nets[key].name !== undefined) {
              obj[key].name = nets[key].name;
            }
          }
          return obj;
        }, {});
    }
  },
  methods: {
    contact(network: string) {
      const net = this.dataNetworks[network];
      const url = this.type == CONTACT ? 
        SocialNetworks.getContactUrl(net, net.name ?? '') : 
        SocialNetworks.getShareUrl(net, this.url, this.title, this.text);
      window.open(url, "_blank");
    }
  }
});
</script>