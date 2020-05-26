<template>
  <resource-card-list
    :card="card"
    :code="code"
    :title="$t('offers')"
    prop-name="offer"
    module-name="offers"
    include="member,category"
  />
</template>
<script lang="ts">
import Vue from "vue";
import ResourceCardList from "../ResourceCardList.vue";
import OfferCard from "../../components/OfferCard.vue";

export default Vue.extend({
  components: {
    ResourceCardList
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data: () => ({
    card: OfferCard
  })
});
</script>
