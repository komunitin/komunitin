<template>
  <q-card v-if="offer" v-card-click-to="`/offers/${offer.attributes.code}`" flat bordered>
    <!-- Header -->
    <q-item>
      <!-- Member avatar & name -->
      <q-item-section avatar>
        <q-avatar>
          <img :src="offer.member.attributes.image" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1" class="text-subtitle2 text-onsurface-m">
          {{ offer.member.attributes.name }}
        </q-item-label>
        <!-- Offer updated date -->
        <!-- FIXME: format date using moment.js library -->
        <q-item-label caption>{{
          offer.attributes.updated
        }}</q-item-label>
      </q-item-section>
      <!-- FIXME: category icon -->
      <q-item-section side>
        <q-avatar color="blue">
          <q-icon name="restaurant" color="icon-light"/>
        </q-avatar>
      </q-item-section>
    </q-item>
    <!-- Offer image -->
    <q-img :src="offer.attributes.images[0].href" />
    
    <!-- offer actions -->
    <q-card-section>
      <div class="text-h6">{{offer.attributes.name}}</div>
      <!-- FIXME: Add price -->
      <div v-clamp="3" v-md2txt="offer.attributes.content" class="text-body2 text-justify"></div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import CardClickTo from "../plugins/CardClickTo";
import Clamp from "../plugins/Clamp";
import Md2txt from "../plugins/Md2txt";

Vue.use(CardClickTo);
Vue.use(Clamp);
Vue.use(Md2txt);

export default Vue.extend({
  name: "OfferCard",
  components: {},
  props: {
    offer: {
      type: Object,
      required: true,
      default: undefined
    }
  },
});
</script>
