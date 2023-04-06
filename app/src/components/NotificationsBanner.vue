<template>
  <q-banner
    v-if="show"
    class="text-onsurface-m banner"
  >
    <template #avatar>
      <q-icon name="notifications"/>
    </template>

    {{ isDenied ? $t("deniedNotificationsText") : $t("enableNotificationsText") }}
    <template #action>
      <q-btn
        flat
        color="primary"
        :label="$t('dismiss')"
        @click="dismiss"
      />
      <q-btn
        v-if="!isDenied"
        flat
        color="primary"
        :label="$t('enableNotifications')"
        @click="subscribe"
      />
    </template>
  </q-banner>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount } from "vue";
import {useStore} from "vuex";

export default defineComponent({
  name: "NotificationsBanner",
  setup() {
    const ready = ref(false);

    const store = useStore()
    const dismissed = computed(() => store.state.ui.notificationsBannerDismissed)
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
    const permission = ref(Notification.permission)
    const isAuthorized = computed(() => permission.value == 'granted')
    const isDenied = computed(() => permission.value == 'denied')

    const show = computed(() => ready.value && isLoggedIn.value && !isAuthorized.value && !dismissed.value)

    const dismiss = () => store.commit("notificationsBannerDismissed", true)
    const subscribe = async () => {
      permission.value = await Notification.requestPermission()
      if (permission.value == 'granted') {
        store.dispatch("subscribe");
      }
    }

    // Initialization.
    onBeforeMount(async () => {
      if (isLoggedIn.value && isAuthorized.value) {
        await store.dispatch("subscribe");
      }
      ready.value = true
    })
    
    return {show, dismiss, subscribe, isDenied}
  },
});
</script>
<style lang="scss" scoped>
.banner{
  border-bottom: solid 1px $separator-color;
}
</style>