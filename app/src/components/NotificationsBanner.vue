<template>
  <q-banner
    v-if="show"
    class="text-onsurface-m"
  >
    {{ $t("enableNotificationsText") }}
    <template #action>
      <q-btn
        flat
        color="primary"
        :label="$t('dismiss')"
        @click="dismiss"
      />
      <q-btn
        flat
        color="primary"
        :label="$t('enableNotifications')"
        @click="subscribe"
      />
    </template>
  </q-banner>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {mapGetters} from "vuex";

export default defineComponent({
  name: "NotificationsBanner",
  data: () => ({
    ready: false,
  }),
  computed: {
    ...mapGetters(["isLoggedIn", "isSubscribed"]),
    dismissed(): boolean {
      return this.$store.state.ui.notificationsBannerDismissed;
    },
    show(): boolean {
      return this.ready && this.isLoggedIn && !this.isSubscribed && !this.dismissed;
    }
  },
  created: async function()  {
    if (this.isLoggedIn && this.isAuthorized()) {
      await this.$store.dispatch("subscribe");
    }
    this.ready = true;
  },
  methods: {
    dismiss(): void {
      this.$store.commit("notificationsBannerDismissed", true);
    },
    async subscribe() {
      const permission = await Notification.requestPermission()
      if (permission == "granted") {
        return this.$store.dispatch("subscribe");
      }
    },
    isAuthorized(): boolean {
      return Notification.permission == 'granted';
    }
  }
});
</script>