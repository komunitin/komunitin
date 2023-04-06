<template>
  <q-page-container>
    <notifications-banner 
      @show-change="notificationsShowChange"
    />
    <location-banner 
      v-if="locationShow"
      @show-change="locationShowChange"
    />
    <slot />
  </q-page-container>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from "vue"
import NotificationsBanner from "../components/NotificationsBanner.vue"
import LocationBanner from "../components/LocationBanner.vue"

/**
 * This component is a layout utility to correctly place banners without interfering with the
 * header dynamic height logic.
 * 
 * Currently there is only one banner available, but whenever there are two or more, we'll have
 * to limit them to just one as per material design recommendation.
 */
export default defineComponent({
  components: {
    NotificationsBanner,
    LocationBanner
  },
  setup() {
    const notificationsWantShow = ref<boolean|undefined>(undefined)
    const notificationsShowChange = (show: boolean) => {notificationsWantShow.value = show}

    const locationWantShow = ref<boolean|undefined>(undefined)
    const locationShowChange = (show: boolean) => {locationWantShow.value = show}

    const locationShow = computed(() => notificationsWantShow.value === false)

    return {locationShowChange, notificationsShowChange, locationShow}
  }
})
</script>