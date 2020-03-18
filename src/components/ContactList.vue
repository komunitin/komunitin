<template>
  <q-list>
    <q-item v-for="(contactGroup) in waysContact" :key="contactGroup.data.id" clickable @click="contact(contactGroup.data.attributes.type, contactGroup.data.attributes.name)" :ref="contactGroup.data.attributes.type">
      <q-item-section avatar>
        <q-avatar size="lg">
          <img :src="`statics/icons/contacts/${contactGroup.data.attributes.type}.svg`" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{contactGroup.data.attributes.name}}</q-item-label>
        <q-item-label caption>{{ contactGroup.data.attributes.type }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'contact-list',
  props: ['waysContact'],
  methods: {
    /**
     * Builds the URL so that the browser can handle the messaging app.
     * **/
    getContactUrl(type: string, name: string) : string {
      const encoded = encodeURIComponent(name);
      switch(type) {
        case 'phone':
          return 'tel:' + encoded;
        case 'email':
          return 'mailto:' + encoded;
        case 'telegram':
          return 'https://t.me/' + encoded;
        case 'whatsapp':
          return 'https://api.whatsapp.com/send?phone=' + encoded;
        default:
          return '';
      }
    },
    // Click handler
    contact(type: string, name: string) {
      const url = this.getContactUrl(type, name);
      if (url != '') {
        window.open(url, '_blank');
      }
    }
  }
});
</script>