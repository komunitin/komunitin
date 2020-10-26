<template>
  <div>
    <page-header :title="$t('offer')" />
    <q-page-container>
      <q-page v-if="offer" class="row q-col-gutter-md q-pa-lg">
        <div class="col-12 col-md-6">
          <member-header ref="member" :member="offer.member" class="q-pt-none q-pl-none q-pb-md"/>
          <div>
            <q-carousel v-model="slide"
              animated
              swipeable
              infinite :arrows="offer.attributes.images.length > 1">
              <q-carousel-slide v-for="(image, i) of offer.attributes.images" :key="i" :name="i + 1" class="q-pa-none" :img-src="image.href">
              </q-carousel-slide>
            </q-carousel>
            <div v-if="offer.attributes.images.length > 1" class="gt-sm q-mt-none row q-col-gutter-sm">
              <div v-for="(image, i) of offer.attributes.images" :key="i" class="col-3">
                <img :src="image.href" class="thumbnail vertical-bottom	" :class="'thumbnail-' + (slide == i + 1 ? 'active' : 'inactive')" @click="slide = i + 1" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 offer-content">
          <category-avatar color="kblue" :category="offer.category" caption/>
          <div class="text-h4 q-pt-md q-pb-sm">{{ offer.attributes.name }}</div>
          <div class="text-h6 q-pb-sm">
            <span class="text-onsurface-m">{{ $t('price') }} </span> 
            <span class="negative-amount">{{ price }}</span>
          </div>
          <div class="text-body2 text-onsurface-m q-pb-md">
            <span>{{ $t('updatedAt', {
                date: $options.filters.date(offer.attributes.updated)
              }) }}</span>
          </div>
          <div v-md2html="offer.attributes.content" class="col text-body1 text-onsurface"></div>
          <div class="text-body2 text-onsurface-m q-pb-md">
            <span>{{ $t('expiresAt', {
                  date: $options.filters.date(offer.attributes.expires)
                }) }}</span>
          </div>
          <div class="q-pb-lg row q-col-gutter-md justify-end">
            <share-button flat color="primary" :label="$t('share')"
              :title="$t('checkThisOffer', {member: offer.member.attributes.name})"
              :text="offer.attributes.name"
            />
            <contact-button unelevated color="primary" :label="$t('contact')" :contacts="offer.member.contacts" /> 
          </div>
        </div>

        <div class="col-12 col-md-6">
          <simple-map class="simple-map" :center="offer.member.attributes.location.coordinates" :marker="offer.member.attributes.location.coordinates" />
          <div class="text-onsurface-m">
            <q-icon name="place" />
{{ offer.member.attributes.location.name }}</div>
        </div>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import PageHeader from "../../layouts/PageHeader.vue";
import CategoryAvatar from "../../components/CategoryAvatar.vue";
import MemberHeader from "../../components/MemberHeader.vue";
import ShareButton from "../../components/ShareButton.vue";
import ContactButton from "../../components/ContactButton.vue";
import SimpleMap from "../../components/SimpleMap.vue";
import Md2html from "../../plugins/Md2html";
import { Offer, Member, Account, Currency } from "../../store/model";

Vue.use(Md2html);

export default Vue.extend({
  components: {
    MemberHeader,
    SimpleMap,
    PageHeader,
    CategoryAvatar,
    ShareButton,
    ContactButton
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    offerCode: {
      type: String,
      required: true
    }
  },
  data: () => ({
    slide: 1
  }),
  computed: {
    offer(): Offer & {member: Member & { account: Account & { currency: Currency } } } {
      return this.$store.getters["offers/current"];
    },
    /**
     * If price is a number, format it following the currency format,
     * otherwise just return the offer.price string.
     */
    price(): string {
      const price = this.offer.attributes.price;
      // Parse string to number.
      const numeric = Number(price);
      if (!isNaN(numeric)) {
        // Append the currency symbol if price is just a number.
        const currency = this.offer.member.account.currency
        return this.$currency(numeric, currency, {scale: false} );
      } else {
        return price;
      }
    }
  },
  created() {
    // See comment in analogous function at Group.vue.
    this.$watch("offerCode", this.fetchData, { immediate: true });
    
  },
  methods: {
    async fetchData(offerCode: string) {
      return this.$store.dispatch("offers/load", {
        code: offerCode,
        group: this.code,
        include: "category,member,member.contacts,member.account,member.account.currency"
      });
    }
  }
})
</script>
<style lang="scss" scope>
.thumbnail {
  width: 100%
}
.thumbnail-inactive {
  opacity: 0.5;
}
.thumbnail-inactive:hover {
  opacity: 1;
}
/**
  In large screens, mark the element on the right column as 0 height so that
  the next row starts just at the end of the first column, to achieve this effect:

  | 1 | 2 |
  | - | 2 |
  | 3 | 2 |
*/
@media (min-width: $breakpoint-md-min){
  .offer-content {
    height: 0 !important;
  }
}

</style>
