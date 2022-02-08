<template>
  <q-card
    v-if="need"
    v-card-click-to="`/groups/${code}/needs/${need.attributes.code}`"
    flat
    bordered
  >
    <!-- Header -->
    <member-header :member="need.member">
      <template #caption>
        {{ need.attributes.updated | date }}
      </template>
      <template #side>
        <category-avatar :category="need.category" type="need"/>
      </template>
    </member-header>
    <!-- Need images -->
    <carousel v-if="hasImages" :images="need.attributes.images" height="200px" />

    <!-- Need text -->
    <q-card-section>
      <div
        v-md2txt="need.attributes.content"
        v-clamp="hasImages ? 3 : 13"
        class="text-body2 text-justify text-onsurface-m"
      />
    </q-card-section>

    <q-card-actions>
      <contact-button flat color="primary" :contacts="need.member.contacts">{{
        $t("reply")
      }}</contact-button>
      <q-space />
      <share-button
        icon="share"
        flat
        round
        color="icon-dark"
        :url="url"
        :title="$t('checkThisNeed', { member: need.member.attributes.name })"
        :text="need.attributes.content"
      />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import CardClickTo from "../plugins/CardClickTo";
import Clamp from "../plugins/Clamp";
import Md2txt from "../plugins/Md2txt";

import Carousel from "./Carousel.vue";
import CategoryAvatar from "./CategoryAvatar.vue";
import ContactButton from "./ContactButton.vue";
import MemberHeader from "./MemberHeader.vue";
import ShareButton from "./ShareButton.vue";

Vue.use(CardClickTo);
Vue.use(Clamp);
Vue.use(Md2txt);

export default Vue.extend({
  name: "NeedCard",
  components: {
    MemberHeader,
    ShareButton,
    ContactButton,
    CategoryAvatar,
    Carousel
  },
  props: {
    // Group code.
    code: {
      type: String,
      required: true,
    },
    need: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    slide: 1
  }),
  computed: {
    hasImages(): boolean {
      return this.need.attributes.images.length > 0;
    },
    url(): string {
      const base = window?.location.origin ?? "";
      return (
        base + this.$router.resolve("needs/" + this.need.attributes.code).href
      );
    }
  }
});
</script>
