<template>
  <form
    class="column q-gutter-md"
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
    >
      <template #append>
        <q-icon name="mail" />
      </template>
    </q-input>
    <q-input
      v-model="pass"
      outlined
      dark
      :type="isPwd ? 'password' : 'text'"
      :label="$t('password')"
      maxlength="30"
      :rules="[val => !v$.pass.$invalid || $t('invalidPassword')]"
      lazy-rules
    >
      <template #append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>

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

<script lang="ts">
import { defineComponent } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength } from '@vuelidate/validators';
import KError, { KErrorCode } from '../../KError';

// Login mail.
export default defineComponent({
  name: 'LoginMail',
  setup () {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      email: '',
      pass: '',
      isPwd: true,
    };
  },
  computed: {
    loginDisabled() : boolean {
      return this.v$.$invalid;
    }
  },
  validations: {
    email: {
      required,
      email
    },
    pass: {
      required,
      minLength: minLength(4)
    }
  },
  methods: {
    async submit() {
      // Validate.
      this.v$.$touch();
      if (this.v$.$invalid) {
        // That should not happen, as the submit button should be disabled when the form is not validated.
        throw new KError(KErrorCode.IncorrectCredentials, "Incorrect email or password");
      }
      // Perform authentication request.
      await this.$store.dispatch("login", {email: this.email, password: this.pass});
      if (this.$store.getters.isLoggedIn) {
        const name = this.$store.state.me.userInfo?.name;
        this.$q.notify({type: "positive", message: this.$t('sucessfulLogin', {name})});
        
        // If user came here due to a redirect when trying to access a protected route,
        // bring them to where they tried to go. 
        const redirect = (typeof this.$route.query.redirect == "string") 
          ? this.$route.query.redirect 
        // I'd prefer redirecting to "/" and let the general router guard to redirect the user
        // where it needs to, but it seems that the Vue Router doesn't allow that.
          : `/groups/${this.$store.getters.myMember.group.attributes.code}/needs`;
        this.$router.push(redirect);
      }
    }
  }
});
</script>
