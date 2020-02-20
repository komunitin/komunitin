<template>
  <div class="home-body">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        color="white"
        icon="arrow_back"
        aria-label="Home"
        @click="$router.back()"
      />
      <q-toolbar-title class="text-white">Komunitin</q-toolbar-title>
    </q-toolbar>
    <div id="login-mail" class="home-body">
      <form @submit.prevent="submit">
        <q-input
          v-model="mail"
          type="email"
          placeholder="example@example.com"
          label="E-mail"
          :error="$v.mail.$invalid"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { required, email, minLength } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';

// Login mail.
export default Vue.extend({
  name: 'LoginMail',
  data() {
    return {
      mail: '',
      pass: '',
      submitStatus: ''
    };
  },
  validations: {
    mail: {
      required,
      email
    },
    pass: {
      required,
      minLength: minLength(10)
    }
  },
  methods: {
    submit() {
      console.log({ submit: true, submitStatus: this.submitStatus });
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR';
        console.log(this.$v);
        this.$q.notify({
          type: 'negative',
          message: 'No se ha podido validar el formulario.'
        });
      } else {
        // @todo do your submit logic here
        this.submitStatus = 'PENDING';
        setTimeout(() => {
          console.log({ validate: true, mail: this.mail, pass: this.pass });
          this.submitStatus = 'OK';
        }, 500);
      }
    }
  }
});
</script>
<style scope>
#login-mail {
  width: 300px;
  display: inline-block;
}

input {
  color: white !important;
}
</style>
