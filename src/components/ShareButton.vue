<template>
  <span>
    <q-btn v-bind="$attrs" @click="share"/>
    <q-dialog v-if="!navigatorShare" v-model="dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{$t('share')}}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <social-network-list :url="url" :title="title" :text="text" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </span>
</template>
<script lang="ts">

import Vue from 'vue';

import SocialNetworkList from './SocialNetworkList.vue';

// Is this browser compatible with share API?
// Experimental API `share` is not (yet) included in Navigator interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const navigatorShare = (typeof ((navigator as any)?.share) !== 'undefined');

export default Vue.extend({
  name: 'ShareButton',
  components: {SocialNetworkList},
  props: {
    url : {
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
  data: function() {
    return {
      // Wheter to show the share dialog.
      dialog: false,
    };
  },
  computed: {
    navigatorShare: () => navigatorShare
  },
  methods: {
    // Main share button click handler.
    share() {
      if (navigatorShare) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).share({
          title: this.title,
          text: this.text,
          url: this.url
        });
      }
      else {
        // display fallback dialog.
        this.dialog = true;
      }
    }
  }
});
</script>
