<template>
  <q-card
    v-if="offer"
    v-card-click-to="`/groups/${code}/offers/${offer.attributes.code}`"
    flat
    bordered
  >
    <!-- Header -->
    <member-header :member="offer.member">
      <template #caption>
        {{ offer.attributes.updated | date }}
      </template>
      <template #side>
        <category-avatar :category="offer.category" color="kblue"/>
      </template>
    </member-header>

    <!-- Offer images -->
    <carousel :images="offer.attributes.images" height="200px"/>

    <!-- offer title and description -->
    <q-card-section>
      <div class="text-h6">{{ offer.attributes.name }}</div>
      <!-- TODO: Add price -->
      <div
        v-clamp="3"
        v-md2txt="offer.attributes.content"
        class="text-body2 text-justify text-onsurface-m"
      ></div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import CardClickTo from "../plugins/CardClickTo";
import Carousel from "./Carousel.vue";
import Clamp from "../plugins/Clamp";
import Md2txt from "../plugins/Md2txt";
import MemberHeader from "./MemberHeader.vue";
import CategoryAvatar from "./CategoryAvatar.vue";

Vue.use(CardClickTo);
Vue.use(Clamp);
Vue.use(Md2txt);

export default Vue.extend({
  name: "OfferCard",
  components: {
    MemberHeader,
    CategoryAvatar,
    Carousel
  },
  props: {
    // Group code.
    code: {
      type: String,
      required: true,
    },
    // Offer object with member and category assotiations.
    offer: {
      type: Object,
      required: true,
      default: undefined
    }
  }
});
</script>
