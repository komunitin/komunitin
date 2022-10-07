<template>
  <div class="row text-onsurface-m">
    <!-- BIO -->
    <div class="column col-12 col-md-8">
      <div>
        <div class="text-overline text-uppercase text-onsurface-d">
          {{ $t('bio') }}
        </div>
        <div v-md2html="member.attributes.description" />
      </div>
      <!-- LOCATION -->
      <div>
        <div class="text-overline text-uppercase text-onsurface-d">
          {{ $t('location') }}
        </div>
        <simple-map
          class="simple-map"
          :center="member.attributes.location.coordinates"
          :marker="member.attributes.location.coordinates"
        />
        <div><q-icon name="place" />{{ member.attributes.location.name }}</div>
      </div>
    </div>
    <!-- CONTACT -->
    <div class="col-12 col-md-4">
      <div class="text-overline text-uppercase text-onsurface-d q-pl-md">
        {{ $t('contact') }}
      </div>
      <social-network-list
        type="contact"
        :contacts="member.contacts"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"

import md2html from "../../plugins/Md2html";

import SimpleMap from "../../components/SimpleMap.vue";
import SocialNetworkList from "../../components/SocialNetworkList.vue"


export default defineComponent({
  name: "MemberProfile",
  components: {
    SimpleMap,
    SocialNetworkList
  },
  directives: {
    md2html
  },
  props: {
    member: {
      type: Object,
      required: true
    }
  }
})
</script>