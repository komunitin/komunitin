<template>
  <q-input
    v-for="(contact, index) in contacts"
    :key="`${contact.id}`"
    :model-value="contact.attributes.name"
    type="text"
    :label="getNetworkLabel(contact.attributes.type)"
    outlined
    :disable="contact.attributes.type === 'email'"
    class="q-mb-md"
    @update:model-value="(name) => updateContact(index, name as string)"
  >
    <template #prepend>
      <q-avatar size="md">
        <img :src="getNetworkIcon(contact.attributes.type)">
      </q-avatar>
    </template>
    <template #append>
      <q-btn
        v-if="contact.attributes.type !== 'email'" 
        flat
        round
        icon="delete"
        @click="deleteContact(contact)"
      />
    </template>
  </q-input>
  <div class="flex justify-end">
    <dialog-form-btn
      :label="$t('addContact')"
      :valid="!!(newContactType && newContactName)"
      :submit="addContact"
    >
      <template #default>
        <q-select 
          v-model="newContactType"
          :label="$t('type')"
          :options="newContactOptions"
          required
          outlined
          :rules="[v => !!v || $t('fieldRequired')]"
        >
          <template #option="{opt, itemProps}">
            <q-item v-bind="itemProps">
              <q-item-section avatar>
                <q-avatar size="md">
                  <img :src="getNetworkIcon(opt.value)">
                </q-avatar>
              </q-item-section>
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="newContactName"
          type="text"
          name="newContactName"
          :label="getNetworkIdLabel(newContactType?.value ?? '')"
          outlined
          required
          class="q-mt-md"
          :rules="[v => !!v || $t('fieldRequired')]"
        />
      </template>
      <template #actions>
        <q-btn
          color="primary"
          flat
          :label="$t('test')"
          @click="testNewContact"
        />
      </template>
    </dialog-form-btn>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { getNetworkIcon, ContactNetworks, getContactUrl } from "./SocialNetworks"
import { useI18n } from "vue-i18n"
import { Contact } from "../store/model"
import { DeepPartial } from "quasar"
import { v4 as uuid } from "uuid"
import DialogFormBtn from "./DialogFormBtn.vue"

// This component accepts and emits an array of contact-like objects,
// having at least the basic attributes type and name.
export type PartialContact = DeepPartial<Contact> & {
  id: string,
  type: "contacts",
  attributes: {type: string, name: string}
}

const props = defineProps<{
  modelValue: PartialContact[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: PartialContact[]): void
}>()

const contacts = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const { t } = useI18n()

const getNetworkLabel = (key: string) => {
  if (!(key in ContactNetworks)) {
    return key
  } else if (ContactNetworks[key].translateLabel) {
    return t(ContactNetworks[key].label)
  } else {
    return ContactNetworks[key].label
  }
}

const getNetworkIdLabel = (key: string) => {
  if (!(key in ContactNetworks)) {
    return key
  } else if (ContactNetworks[key].translateIdLabel) {
    return t(ContactNetworks[key].idLabel)
  } else {
    return ContactNetworks[key].idLabel
  }
}

const newContactType = ref()
const newContactName = ref<string>()
const newContactOptions = computed(() => Object.keys(ContactNetworks).map((key) => ({
  label: getNetworkLabel(key),
  value: key,
  disable: contacts.value.some(contact => contact.attributes?.type === key)
})))
const testNewContact = () => {
  if (newContactType.value && newContactName.value) {
    const url = getContactUrl(ContactNetworks[newContactType.value.value], newContactName.value)
    window.open(url, '_blank')
  }
}

const addContact = () => {
  if (newContactType.value && newContactName.value) {
    contacts.value = [
      ...contacts.value,
      {
        id: uuid(),
        type: "contacts",
        attributes: {
          type: newContactType.value.value,
          name: newContactName.value
        }
      }
    ]
    newContactType.value = undefined
    newContactName.value = undefined
  }
}

const deleteContact = (contact: PartialContact) => {
  contacts.value = contacts.value.filter(c => c.attributes.type !== contact.attributes.type || c.attributes.name !== contact.attributes.name)
}

const updateContact = (index: number, name: string) => {
  // we update the root object so the reactive setter is triggered
  contacts.value = [
    ...contacts.value.slice(0, index),
    {
      ...contacts.value[index],
      attributes: {
        ...contacts.value[index].attributes,
        name
      }
    },
    ...contacts.value.slice(index + 1)
  ]
}

</script>