<template>
  <resource-cards
    :card="card"
    :code="groupCode"
    prop-name="offer"
    module-name="offers"
    include="category"
    :filter="filter"
  />
</template>
<script lang="ts">
import Vue from "vue"
import ResourceCards from "../ResourceCards.vue";
import OfferCard from "../../components/OfferCard.vue";

export default Vue.extend({
  name: "MemberOffers",
  components: {
    ResourceCards
  },
  props: {
    groupCode: {
      type: String,
      required: true
    },
    member: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      card: OfferCard,
      filter: {
        member: this.member.id
      }
    }
  }
})
</script>