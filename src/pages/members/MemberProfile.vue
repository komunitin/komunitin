<template>
  <div class="row text-onsurface-m">
    <!-- BIO -->
    <div class="col-12 col-md-8">
      <div class="text-overline text-uppercase text-onsurface-d">{{$t('bio')}}</div>
      <div v-md2html="member.attributes.description"></div>
    </div>
    <!-- CONTACT -->
    <div class="col-12 col-md-4">
      <div class="text-overline text-uppercase text-onsurface-d q-pl-md">{{$t('contact')}}</div>
      <social-network-list type="contact" :contacts="member.contacts" />
    </div>
    <!-- LOCATION -->
    <div class="col-12 col-md-8">
      <div class="text-overline text-uppercase text-onsurface-d">{{$t('location')}}</div>
      <simple-map class="simple-map" :center="member.attributes.location.coordinates" :marker="member.attributes.location.coordinates" />
      <div><q-icon name="place" />{{ member.attributes.location.name }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import SimpleMap from "../../components/SimpleMap.vue";
import SocialNetworkList from "../../components/SocialNetworkList.vue"
import Md2html from "../../plugins/Md2html";

Vue.use(Md2html);

export default Vue.extend({
  name: "MemberProfile",
  components: {
    SimpleMap,
    SocialNetworkList
  },
  props: {
    member: {
      type: Object,
      required: true
    }
  }
})
</script>