<template>
  <q-form 
    class="q-gutter-y-lg"
    @submit="submit" 
  >
    <div class="text-onsurface-m">
      {{ $t('chooseAccountNoListingText', {group: group.attributes.name}) }}
    </div>
    <q-input
      ref="accountRef"
      v-model="accountCode"
      type="text"
      name="accountCode"
      :label="$t('accountCode')"
      :hint="$t('accountCodeHint', {code: group.attributes.code})"
      :loading="isLoading"
      debounce="500"
      outlined
      required
      :rules="[
        (v: string) => !!v || $t('accountCodeRequired'),
        () => !!account || $t('accountCodeInvalid')
      ]"
    >
      <template #append>
        <q-icon 
          v-if="!isLoading && !(accountRef?.hasError)"
          name="wallet" 
        />
      </template>
    </q-input>
    <q-btn
      :label="$t('setAccount')"
      type="submit"
      color="primary"
      unelevated
      :disable="accountRef?.hasError"
    />
  </q-form>
</template>
<script setup lang="ts">
import { QInput } from 'quasar'
import { Account, Group } from 'src/store/model'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps<{
  group: Group
  modelValue?: Account|undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Account|undefined): void
  (e: 'submit'): void
}>()

const value = computed<Account|undefined>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const accountCode = ref('')

const accountRef = ref<QInput>()
const account = ref<Account|undefined>(undefined)

watch(value, (newValue) => {
  accountCode.value = newValue?.attributes?.code ?? ''
  account.value = newValue
}, {
  immediate: true
})

const store = useStore()
const isLoading = ref(false)

// Fetch and set account object.
watch([accountCode], async () => {
  accountRef.value?.resetValidation()
  isLoading.value = true
  const currencyUrl = props.group.relationships.currency.links.related
  const baseUrl = currencyUrl.replace('/currency', '')
  const accountUrl = `${baseUrl}/accounts?filter[code]=${accountCode.value}&include=currency`

  try {
    await store.dispatch('accounts/load', {
      url: accountUrl,
      group: props.group.attributes.code
    })
    account.value = store.getters['accounts/current']
  } catch (error) {
    account.value = undefined
  } finally {
    isLoading.value = false
    accountRef.value?.validate()
  }
})

const submit = () => {
  accountRef.value?.validate()
  if (!accountRef.value?.hasError) {
    value.value = account.value
    emit('submit')
  }
}

</script>