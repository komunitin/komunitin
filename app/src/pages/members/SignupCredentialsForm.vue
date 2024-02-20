<template>
  <q-form class="q-gutter-y-lg" @submit="emit('submit')">
    <div>
      {{ $t('signupCredentialsText') }}
    </div>
    <q-input
      v-model="name"
      type="text"
      name="name"
      :label="$t('name')"
      :hint="$t('nameHint')"
      outlined
      required
      :rules="[(v) => !!v || $t('nameRequired')]"
    />
    <q-input
      name="email"
      v-model="email"
      :label="$t('email')"
      :hint="$t('emailChangeHint')"
      outlined
      :rules="[() => !v$.email.$invalid || $t('invalidEmail')]"
    />
    <password-field
      name="password"
      v-model="password"
      :label="$t('newPassword')"
      :hint="$t('newPasswordHint')"
    />
    <q-btn
      :label="$t('submit')"
      type="submit"
      color="primary"
      unelevated
      :disable="v$.$invalid"
    />
  </q-form>
</template>
<script setup lang="ts">
import PasswordField from 'src/components/PasswordField.vue'
import useVuelidate from "@vuelidate/core"
import { required, email as vemail } from "@vuelidate/validators"
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  modelValue: {
    name: string
    email: string
    password: string
  }
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: {name: string, email: string, password: string}): void,
  (e: "submit"): void
}>()

const name = ref(props.modelValue.name)
const email = ref(props.modelValue.email)
const password = ref(props.modelValue.password)

const v$ = useVuelidate({
  email: {required, vemail},
  password: {required},
  name: {required}
}, {name, email, password})

watchEffect(() => {
  emit('update:modelValue', {name: name.value, email: email.value, password: password.value})
})



</script>