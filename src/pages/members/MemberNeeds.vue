<template>
  <resource-cards
    :card="card"
    :code="groupCode"
    prop-name="need"
    module-name="needs"
    include="category"
    :filter="filter"
  />
</template>
<script lang="ts">
import Vue from "vue"
import ResourceCards from "../ResourceCards.vue";
import NeedCard from "../../components/NeedCard.vue";

export default Vue.extend({
  name: "MemberNeeds",
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
      card: NeedCard,
      filter: {
        member: this.member.id
      }
    }
  }
})
</script>