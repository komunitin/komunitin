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
<script setup lang="ts">
import { computed } from "vue"
import ResourceCards from "../ResourceCards.vue";
import OfferCard from "../../components/OfferCard.vue";
import { Member } from "../../store/model";
import { useStore } from "vuex";

const props = defineProps<{
  groupCode: string,
  member: Member
}>()
const store = useStore()
const isMe = computed(() => props.member && props.member.id == store.getters.myMember.id)
const card = OfferCard.name
const filter = computed(() => ({
  member: props.member.id,
  expired: 'false' + (isMe.value ? ',true' : ''),
  state: 'published' + (isMe.value ? ',hidden' : '')
}))
</script>