<template>
  <resource-card-list
    :card="card"
    :code="code"
    :title="$t('needs')"
    prop-name="need"
    module-name="needs"
    include="category,member,member.contacts"
  />
</template>
<script lang="ts">
import Vue from "vue";
import ResourceCardList from "../ResourceCardList.vue";
import NeedCard from "../../components/NeedCard.vue";

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
    card: NeedCard
  })
});
</script>
