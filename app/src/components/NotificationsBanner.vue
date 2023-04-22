<template>
  <q-banner
    v-if="show"
    class="text-onsurface-m banner"
  >
    <template #avatar>
      <q-icon name="notifications" />
    </template>

    {{ text }}
    <template #action>
      <q-btn
        flat
        color="primary"
        :label="$t('dismiss')"
        @click="dismiss"
      />
      <q-btn
        v-if="isCompatible && !isDenied"
        flat
        color="primary"
        :label="$t('enableNotifications')"
        @click="subscribe"
      />
    </template>
  </q-banner>
</template>
<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
const {t} = useI18n()

const emit = defineEmits(["showChange"])

const ready = ref(false);

const store = useStore()
const dismissed = computed(() => store.state.ui.notificationsBannerDismissed)
const isLoggedIn = computed(() => store.getters.isLoggedIn)
const isCompatible = computed(() => (window && 'Notification' in window))
const permission = ref(isCompatible.value && Notification.permission)
const isAuthorized = computed(() => permission.value == 'granted')
const isDenied = computed(() => permission.value == 'denied')
const text = computed(() => {
  if (isCompatible.value) {
    return isDenied.value ? t("deniedNotificationsText") : t("enableNotificationsText")
  } else {
    return t("incompatibleNotificationsText")
  }
})

const show = computed(() => ready.value && isLoggedIn.value && !isAuthorized.value && !dismissed.value)

watch(show, (oldShow, newShow) => {
  if (oldShow != newShow) {
    emit("showChange", show.value)
  }
})

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

</script>
<style lang="scss" scoped>
.banner {
  border-bottom: solid 1px $separator-color;
}
</style>