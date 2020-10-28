<template>
  <div>
    <page-header :title="$t('need')" />
    <q-page-container>
      <q-page v-if="need" class="q-pa-lg">
        <offer-layout :num-images="need.attributes.images.length">
          <template #member>
            <member-header :to="`/groups/${code}/members/${need.member.attributes.code}`" :member="need.member" class="q-pa-none"/>
          </template>
          <template #category>
            <category-avatar color="kred" :category="need.category" caption/>
          </template>
          <template #images>
            <carousel :images="need.attributes.images" thumbnails height="400px" />
          </template>
          <template #content>
            <div class="text-body2 text-onsurface-m q-pb-md">
              <span>{{ $t('updatedAt', {
                  date: $options.filters.date(need.attributes.updated)
                }) }}</span>
            </div>
            <div v-md2html="need.attributes.content" class="col text-body1 text-onsurface"></div>
            <div class="text-body2 text-onsurface-m q-pb-md">
              <span>{{ $t('expiresAt', {
                    date: $options.filters.date(need.attributes.expires)
                  }) }}</span>
            </div>
            <div class="q-pb-lg row q-col-gutter-md justify-end">
              <share-button flat color="primary" :label="$t('share')"
                :title="$t('checkThisNeed', {member: need.member.attributes.name})"
                :text="need.attributes.text"
              />
              <contact-button unelevated color="primary" :label="$t('contact')" :contacts="need.member.contacts" /> 
            </div>
          </template>
          <template #map>
            <simple-map class="simple-map" :center="need.member.attributes.location.coordinates" :marker="need.member.attributes.location.coordinates" />
            <div class="text-onsurface-m">
              <q-icon name="place" />
              {{ need.member.attributes.location.name }}
            </div>
          </template>
        </offer-layout>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

import PageHeader from "../../layouts/PageHeader.vue";
import OfferLayout from "../../layouts/OfferLayout.vue";
import CategoryAvatar from "../../components/CategoryAvatar.vue";
import MemberHeader from "../../components/MemberHeader.vue";
import ShareButton from "../../components/ShareButton.vue";
import ContactButton from "../../components/ContactButton.vue";
import Carousel from "../../components/Carousel.vue";
import SimpleMap from "../../components/SimpleMap.vue";
import Md2html from "../../plugins/Md2html";
import { Need } from "../../store/model";

Vue.use(Md2html);

export default Vue.extend({
  components: {
    MemberHeader,
    SimpleMap,
    PageHeader,
    CategoryAvatar,
    ShareButton,
    ContactButton,
    Carousel,
    OfferLayout
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    needCode: {
      type: String,
      required: true
    }
  },
  computed: {
    need(): Need {
      return this.$store.getters["needs/current"];
    },
    
  },
  created() {
    // See comment in analogous function at Group.vue.
    this.$watch("needCode", this.fetchData, { immediate: true });
  },
  methods: {
    async fetchData(needCode: string) {
      return this.$store.dispatch("needs/load", {
        code: needCode,
        group: this.code,
        include: "category,member,member.contacts,member.account"
      });
    }
  }
})
</script>