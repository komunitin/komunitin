<template>
  <div id="login-mail">
    <form @submit.prevent="submit">
      <q-input
        v-model="email"
        type="email"
        label="E-mail"
        :error-message="mensaError('email')"
        :error="$v.email.$invalid"
        counter
        color="white"
        labelColor="white"
        text-color="white"
        maxlength="30"
      />

      <q-input
        v-model="pass"
        type="password"
        label="Contraseña"
        color="white"
        :error-message="mensaError('pass')"
        :error="$v.pass.$invalid"
        counter
        maxlength="10"
        labelColor="white"
        text-color="white"
      />

      <q-btn
        outline
        color="transparent"
        text-color="white"
        :label="$t('Login')"
        icon="account_circle"
        :disabled="submitStatus === 'PENDING'"
        type="submit"
      />
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { required, email, minLength } from 'vuelidate/lib/validators';

// Login mail.
export default Vue.extend({
  name: 'LoginMail',
  data() {
    return {
      email: '',
      pass: '',
      submitStatus: null
    };
  },
  validations: {
    email: { required, email },
    pass: { required, minLength: minLength(4) }
  },
  methods: {
    submit() {
      console.log({ submit: true, submitStatus: this.submitStatus });
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR';
      } else {
        // @todo do your submit logic here
        this.submitStatus = 'PENDING';
        setTimeout(() => {
          console.log({ validate: true, email: this.email, pass: this.pass });
          this.submitStatus = 'OK';
        }, 500);
      }
    },
    mensaError(campo) {
      if (campo === 'email') {
        if (!this.$v.email.email) return 'Debe ser un email';
        if (!this.$v.email.required) return 'Campo requerido';
      }
      if (campo === 'pass') {
        if (!this.$v.pass.minLength) return 'Tamaño minimo 4 caracteres';
        if (!this.$v.pass.required) return 'Campo requerido';
      }
    }
  }
});
</script>
<style lang="stylus">
#login-mail {
  width: 300px;
  display: inline-block;
}
input {
    color: white !important;
}
</style>
