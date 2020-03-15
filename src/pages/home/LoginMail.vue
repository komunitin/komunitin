<template>
      <form @submit.prevent="submit" class="column q-gutter-md">
        <q-input
          outlined dark
          v-model="email"
          type="email"
          placeholder="example@example.com"
          :label="$t('Email')"
          maxlength="30"
          :rules="[val => !$v.email.$invalid || $t('Invalid email')]"
          lazy-rules
        >
          <template v-slot:append>
            <q-icon name="mail"/>
          </template>
        </q-input>
        <q-input
          outlined dark
          v-model="pass"
          :type="isPwd ? 'password' : 'text'"
          :label="$t('Password')"
          maxlength="30"
          :rules="[val => !$v.pass.$invalid || $t('Invalid password')]"
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
          text-color="white"
          :label="$t('Login')"
          icon="account_circle"
          :disabled="submitStatus === 'PENDING'"
          type="submit"
        />
      </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { required, email, minLength } from 'vuelidate/lib/validators';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validationMixin } from 'vuelidate';

// Login mail.
export default Vue.extend({
  name: 'LoginMail',
  data() {
    return {
      email: '',
      pass: '',
      submitStatus: '',
      isPwd: true,
    };
  },
  validations: {
    email: {
      required,
      email
    },
    pass: {
      required,
      minLength: minLength(8)
    }
  },
  methods: {
    submit() {
      // Validate.
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
          console.log({ validate: true, email: this.email, pass: this.pass });
          this.submitStatus = 'OK';
        }, 500);
      }
    }
  }
});
</script>
