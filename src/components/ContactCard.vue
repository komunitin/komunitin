<template>
  <q-card class="contact-card" v-if="waysContact.length">
    <q-item v-for="(contactGroup) in waysContact" :key="contactGroup.data.id ">
      <q-item-section avatar>
        <q-avatar>
          <q-icon :name="`img:statics/icons/contacts/${contactGroup.data.attributes.type}.svg`" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label v-if="contactGroup.data.attributes.type === 'phone'">
          <a
            target="_blank"
            :href="`tel:${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'email'">
          <a
            target="_blank"
            :href="`mailto:${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'telegram'">
          <a
            target="_blank"
            :href="`https://t.me/${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'whatsapp'">
          <a
            target="_blank"
            :href="`https://api.whatsapp.com/send?phone=${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else>{{contactGroup.data.attributes.name}}</q-item-label>
        <q-item-label caption>{{ contactGroup.data.attributes.type }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'contact-card',
  props: ['waysContact']
});
</script>
<style scoped>
.contact-card .q-icon.notranslate {
  width: 38px;
  height: auto;
}
.contact-card a {
  color: black;
  text-decoration: none;
}
</style>