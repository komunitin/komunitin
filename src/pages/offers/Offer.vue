<template>
  <div>
    <page-header :title="$t('offer')" />
    <q-page-container>
      <q-page v-if="offer" class="q-pa-lg">
        <offer-layout :num-images="offer.attributes.images.length">
          <template #member>
            <member-header :to="`/groups/${code}/members/${offer.member.attributes.code}`" :member="offer.member" class="q-pa-none"/>
          </template>
          <template #category>
            <category-avatar color="kblue" :category="offer.category" caption/>
          </template>
          <template #images>
            <carousel :images="offer.attributes.images" thumbnails height="400px"/>
          </template>
          <template #content>
            <div class="text-h4 q-pb-sm">{{ offer.attributes.name }}</div>
            <div class="text-h6 q-pb-sm">
              <span class="text-onsurface-m">{{ $t('price') }}</span>
              <span>&nbsp;</span>
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
          </template>
          <template #map>
            <simple-map class="simple-map" :center="offer.member.attributes.location.coordinates" :marker="offer.member.attributes.location.coordinates" />
            <div class="text-onsurface-m">
              <q-icon name="place" />
              {{ offer.member.attributes.location.name }}
            </div>
          </template>
        </offer-layout>
      </q-page>
    </q-page-container>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import PageHeader from "../../layouts/PageHeader.vue";
import OfferLayout from "../../layouts/OfferLayout.vue";
import CategoryAvatar from "../../components/CategoryAvatar.vue";
import MemberHeader from "../../components/MemberHeader.vue";
import ShareButton from "../../components/ShareButton.vue";
import ContactButton from "../../components/ContactButton.vue";
import Carousel from "../../components/Carousel.vue";
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
    ContactButton,
    Carousel,
    OfferLayout
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
