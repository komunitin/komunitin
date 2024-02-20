<template>
  <page-header
    :title="$t('signup')"
    back="/groups"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6 q-mb-xl"
      v-if="settings && group"
    >
      <signup-accept-terms-form
        v-if="settings.requireAcceptTerms && !acceptTerms"  
        :group="group"
        :terms="settings.terms"
        @accept="acceptTerms = true"
      />
      <signup-credentials-form
        v-else-if="acceptTerms"
        v-model="credentials"
        @sumbit="createUser"
      />
      <div v-else>
        {{ $t('signupVerifyEmail') }}
      </div>
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import SignupAcceptTermsForm from "./SignupAcceptTermsForm.vue"
import SignupCredentialsForm from "./SignupCredentialsForm.vue"

import { KOptions } from "src/boot/koptions";
import { useFetch } from "@vueuse/core";
import { GroupSignupSettings } from "src/store/model";
import { useStore } from "vuex";
import { computed, ref } from "vue";

const props = defineProps<{
  code: string
}>()

const store = useStore()

store.dispatch("groups/load", {
  code: props.code
})
const group = computed(() => store.getters["groups/current"])

const { data } = useFetch<{data: GroupSignupSettings}>(KOptions.url.social + "/" + props.code + "/signup-settings").json()
const settings = computed(() => data.value?.data.attributes)

const acceptTerms = ref(false)

const credentials = ref({
  name: "",
  email: "",
  password: "",
})

const createUser = () => {
  console.log("create user")
}

</script>