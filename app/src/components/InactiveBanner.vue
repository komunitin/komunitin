<template>
  <q-banner
    v-if="show"
    class="text-onsurface-m banner"
  >
    <template #avatar>
      <q-icon name="verified_user" />
    </template>
    {{ $t('inactiveAccountBannerText') }}
    <template #action>
      <q-btn
        flat
        color="primary"
        :label="$t('dismiss')"
        @click="dismissInactive"
      />
    </template>
  </q-banner>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const store = useStore()
const route = useRoute()

const dismissed = computed(() => store.state.ui.inactiveBannerDismissed)
const dismissInactive = () => store.commit("inactiveBannerDismissed", true)
const isSignupMemberPage = computed(() => route.name === "SignupMember")

const show = computed(() => !dismissed.value && store.getters.isLoggedIn && !store.getters.isActive && !isSignupMemberPage.value)

defineExpose({show})

</script>
