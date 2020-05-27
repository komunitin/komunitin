<template>
  <resource-card-list
    :card="card"
    code=""
    :title="$t('groupsNearYou')"
    prop-name="group"
    module-name="groups"
    include="contacts"
  />
</template>
<script lang="ts">
import Vue from "vue";
import ResourceCardList from "../ResourceCardList.vue";
import GroupCard from "../../components/GroupCard.vue";

export default Vue.extend({
  components: {
    ResourceCardList
  },
  data: () => ({
    card: GroupCard
  })
});
</script>