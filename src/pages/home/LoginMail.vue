<template>
      <form class="column q-gutter-md" @submit.prevent="submit">
        <q-input
          v-model="email" outlined
          dark
          type="email"
          placeholder="example@example.com"
          :label="$t('email')"
          maxlength="30"
          :rules="[val => !$v.email.$invalid || $t('invalidEmail')]"
          lazy-rules
        >
          <template v-slot:append>
            <q-icon name="mail"/>
          </template>
        </q-input>
        <q-input
          v-model="pass" outlined
          dark
          :type="isPwd ? 'password' : 'text'"
          :label="$t('password')"
          maxlength="30"
          :rules="[val => !$v.pass.$invalid || $t('invalidPassword')]"
          lazy-rules
        >
          <template v-slot:append>
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
          :label="$t('login')"
          icon="account_circle"
          :disabled="loginDisabled"
          type="submit"
        />
      </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { required, email, minLength } from 'vuelidate/lib/validators';
import KError, { KErrorCode } from '../../KError';

// Login mail.
export default Vue.extend({
  name: 'LoginMail',
  data() {
    return {
      email: '',
      pass: '',
      isPwd: true,
    };
  },
  computed: {
    loginDisabled() : boolean {
      return this.$v.$invalid;
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
      this.$v.$touch();
      if (this.$v.$invalid) {
        // That should not happen, as the submit button should be disabled when the form is not validated.
        throw new KError(KErrorCode.IncorrectCredentials, "Incorrect email or password");
      }
      // Perform authentication request.
      const user = await this.$auth.login(this.email, this.pass);
      this.$q.notify({type: "positive", message: `Successfully logged in ${user.name} !`});
    }
  }
});
</script>
