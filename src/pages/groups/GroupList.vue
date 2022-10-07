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
import { defineComponent } from "vue";
import ResourceCardList from "../ResourceCardList.vue";
import GroupCard from "../../components/GroupCard.vue";

export default defineComponent({
  components: {
    ResourceCardList
  },
  data: () => ({
    card: GroupCard
  })
});
</script>