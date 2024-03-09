<template>
  <inactive-banner
    ref="inactiveBanner"
  />
  <notifications-banner
    v-if="!(inactiveBanner?.show)"
    ref="notificationsBanner"
  />
  <location-banner
    v-if="!(inactiveBanner?.show || notificationsBanner?.show)"
    ref="locationBanner"
  />
</template>
<script setup lang="ts">
import { ref } from "vue"
import NotificationsBanner from "../components/NotificationsBanner.vue"
import LocationBanner from "../components/LocationBanner.vue"
import InactiveBanner from "../components/InactiveBanner.vue"

const inactiveBanner = ref<InstanceType<typeof InactiveBanner>>()
const notificationsBanner = ref<InstanceType<typeof NotificationsBanner>>()
const locationBanner = ref<InstanceType<typeof LocationBanner>>()

</script>
<style lang="scss" scoped>
  .banner {
    border-bottom: solid 1px $separator-color;
  }
</style>