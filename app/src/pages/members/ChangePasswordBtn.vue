<template>
  <dialog-form-btn 
    :label="$t('changePassword')"
    :text="$t('changePasswordText')"
    :valid="!!(oldPassword && newPassword) && newPassword.length >= 8"
    :submit="changePassword"
  >
    <template #default>
      <password-field
        v-model="oldPassword"
        :label="$t('oldPassword')"
        :hint="$t('oldPasswordHint')"
        class="q-mb-md"
        :error="passwordInvalid"
      />
      <password-field
        v-model="newPassword"
        :label="$t('newPassword')"
        :hint="$t('newPasswordHint')"
      />
    </template>
  </dialog-form-btn>
</template>
<script setup lang="ts">
import { User, Group } from '../../store/model'
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import DialogFormBtn from '../../components/DialogFormBtn.vue'
import PasswordField from '../../components/PasswordField.vue'
import { Notify } from "quasar"
import { useI18n } from 'vue-i18n'
import KError, { KErrorCode } from 'src/KError'

const props = defineProps<{
  user: User
  group: Group
}>();

const oldPassword = ref<string>('')
const newPassword = ref<string>('')
const passwordInvalid = ref(false)

const store = useStore()
const { t } = useI18n()

const changePassword = async () => {
  try {
    await store.dispatch("users/update", {
      code: props.user.id,
      group: props.group.attributes.code,
      resource: {
        attributes: {
          password: oldPassword.value,
          newPassword: newPassword.value
        }
      }
    })
    Notify.create({
      message: t('passwordChanged'),
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    if (error instanceof KError && error.code == KErrorCode.InvalidPassword) {
      passwordInvalid.value = true
    }
    throw error
  }
}

watch([oldPassword], () => {
  passwordInvalid.value = false
})
</script>