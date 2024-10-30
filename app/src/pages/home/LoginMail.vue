<template>
  <form
    class="column q-gutter-y-md"
    @submit.prevent="submit"
  > 
    <q-input
      v-model="email"
      outlined
      dark
      type="email"
      placeholder="example@example.com"
      :label="$t('email')"
      maxlength="30"
      :rules="[val => !v$.email.$invalid || $t('invalidEmail')]"
      lazy-rules
      autocomplete="username"
    >
      <template #append>
        <q-icon name="mail" />
      </template>
    </q-input>
    <password-field 
      v-model="pass" 
      dark
    />
    <div class="row justify-end q-mt-xs">
      <router-link
        to="/forgot-password" 
        class="text-onoutside-m link"
        @click.prevent="forgotPassword = true"
      >
        {{ $t('forgotPassword') }}
      </router-link>
    </div>
    <q-btn
      outline
      color="transparent"
      text-color="onoutside"
      :label="$t('logIn')"
      icon="account_circle"
      :disabled="loginDisabled"
      type="submit"
    />
  </form>
</template>

<script setup lang="ts">
import PasswordField from "../../components/PasswordField.vue";
import { computed, ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email as emailv, minLength } from '@vuelidate/validators';
import KError, { KErrorCode } from '../../KError';
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";


const email = ref('')
const pass = ref('')
const forgotPassword = ref(false)

const v$ = useVuelidate({
  email: { required, emailv },
  pass: { required, minLength: minLength(4) }
}, { email, pass })

const $q = useQuasar()
const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const loginDisabled = computed(() => {
  return v$.value.$invalid;
})

const submit = async () => {
  // Validate.
  v$.value.$touch();
  if (v$.value.$invalid) {
    // That should not happen, as the submit button should be disabled when the form is not validated.
    throw new KError(KErrorCode.IncorrectCredentials, "Incorrect email or password");
  }
  // Perform authentication request.
  try {
    $q.loading.show({
      delay: 200
    })
    await store.dispatch("login", {email: email.value, password: pass.value});
  }
  finally {
    $q.loading.hide()
  }
  
  if (store.getters.isLoggedIn) {
    $q.notify({type: "positive", message: t('sucessfulLogin', {name: email.value})});
    
    // If user came here due to a redirect when trying to access a protected route,
    // bring them to where they tried to go. 
    const redirect = (typeof route.query.redirect == "string") 
      ? route.query.redirect 
    // I'd prefer redirecting to "/" and let the general router guard to redirect the user
    // where it needs to, but it seems that the Vue Router doesn't allow that.
      : `/groups/${store.getters.myMember.group.attributes.code}/needs`;
    router.push(redirect);
  }
}

</script>
