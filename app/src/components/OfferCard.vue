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
        {{ $formatDate(offer.attributes.updated) }}
      </template>
      <template #side>
        <category-avatar
          :category="offer.category"
          type="offer"
        />
      </template>
    </member-header>

    <!-- Offer images -->
    <carousel
      :images="offer.attributes.images"
      height="200px"
    />

    <!-- offer title and description -->
    <q-card-section>
      <div class="text-h6">
        {{ offer.attributes.name }}
      </div>
      <!-- TODO: Add price -->
      <div
        v-clamp="3"
        class="text-body2 text-justify text-onsurface-m"
      >
        {{ md2txt(offer.attributes.content) }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import cardClickTo from "../plugins/CardClickTo";
import clamp from "../plugins/Clamp";
import md2txt from "../plugins/Md2txt";

import Carousel from "./Carousel.vue";
import CategoryAvatar from "./CategoryAvatar.vue";
import MemberHeader from "./MemberHeader.vue";


export default defineComponent({
  name: "OfferCard",
  components: {
    MemberHeader,
    CategoryAvatar,
    Carousel
  },
  directives: {
    clamp,
    cardClickTo
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
  },
  setup() {
    return {
      md2txt
    }
  }
});
</script>
