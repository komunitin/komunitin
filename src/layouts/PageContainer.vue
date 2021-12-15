<template>
  <q-page-container>
    <notifications-banner/>
    <slot/>
  </q-page-container>
</template>
<script lang="ts">
import Vue from "vue"
import NotificationsBanner from "../components/NotificationsBanner.vue"

/**
 * This component is a layout utility to correctly place banners without interfering with the
 * header dynamic height logic.
 * 
 * Currently there is only one banner available, but whenever there are two or more, we'll have
 * to limit them to just one as per material design recommendation.
 */
export default Vue.extend({
  components: {
    NotificationsBanner
  }
})
</script>