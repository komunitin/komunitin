<template>
  <page-header 
    :title="$t('editProfile')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <div class="q-gutter-y-lg">
        <div>
          <div class="text-subtitle1">
            {{ $t('enterProfileData') }}
          </div>
          <div class="text-onsurface-m">
            {{ $t('editProfileHelpText') }}
          </div>
        </div>
        <avatar-field
          v-model="image"
          :text="myMember?.attributes.name ?? ''"
        />
        <q-input
          v-model="name"
          type="text"
          name="name"
          :label="$t('name')"
          :hint="$t('nameHint')"
          outlined
          required
          :rules="[() => !v$.name.$invalid || $t('nameRequired')]"
        >
          <template #append>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input 
          v-model="description"
          type="textarea"
          name="description"  
          :label="$t('bio')" 
          :hint="$t('bioHint')" 
          outlined 
          autogrow 
          input-style="min-height: 100px;"
        >
          <template #append>
            <q-icon name="notes" />
          </template>
        </q-input>
        <q-input
          v-model="email"
          type="text"
          name="email"
          :label="$t('email')"
          :hint="$t('emailHint')"
          outlined
          required
          disabled
        >
          <template #append>
            <q-icon name="email" />
          </template>
        </q-input>
        <div class="row">
          <q-btn
            class="col-6"
            flat
            color="primary"
            :label="$t('changeEmail')"
          />
          <q-btn
            class="col-6"
            flat
            color="primary"
            :label="$t('changePassword')"
          />
        </div>
      </div>
      <div>
        <div class="text-overline text-uppercase text-onsurface-m text-bold q-mt-lg q-mb-sm">
          {{ $t('location') }}
        </div>
        <location-picker 
          v-model="location"
          :default-location="myMember?.group?.attributes.location?.coordinates"
        />
        <q-input
          v-model="address"
          type="text"
          name="address"
          :label="$t('address')"
          outlined
          class="q-my-md"
        />
        <q-input
          v-model="postalCode"
          type="text"
          name="postalCode"
          :label="$t('postalCode')"
          outlined
          required
          :rules="[() => !v$.postalCode.$invalid || $t('fieldRequired')]"
        />
        <q-input
          v-model="city"
          type="text"
          name="city"
          :label="$t('city')"
          outlined
          required
          :rules="[() => !v$.city.$invalid || $t('fieldRequired')]"
        />
        <q-input
          v-model="region"
          type="text"
          name="region"
          :label="$t('region')"
          outlined
          required
          :rules="[() => !v$.region.$invalid || $t('fieldRequired')]"
        />
        <country-chooser
          v-model="country"
          :label="$t('country')"
          outlined
          required
          :rules="[() => !v$.country.$invalid || $t('fieldRequired')]"
        />
      </div>
      <div>
        <div class="text-overline text-uppercase text-onsurface-m text-bold q-mt-lg q-mb-sm">
          {{ $t('contact') }}
        </div>
        <q-input
          v-for = "contact in myMember?.contacts"
          :key="contact.id"
          v-model="contact.attributes.name"
          type="text"
          :label="getNetworkLabel(contact.attributes.type)"
          outlined
          class="q-mb-md"
        >
          <template #prepend>
            <q-avatar size="md">
              <img :src="getNetworkIcon(contact.attributes.type)">
            </q-avatar>
          </template>
          <template #append>
            <q-btn 
              flat
              round
              icon="delete"
            />
          </template>
        </q-input>
        <div class="flex justify-end">
          <q-btn
            flat
            color="primary"
            :label="$t('addContact')"
            icon="add"
          />
        </div>
      </div>
    </q-page>
  </page-container>
</template>
<script setup lang="ts">

import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import AvatarField from "../../components/AvatarField.vue"
import LocationPicker from "../../components/LocationPicker.vue"
import CountryChooser from "../../components/CountryChooser.vue"
import { getNetworkIcon, ContactNetworks } from "../../components/SocialNetworks"

import { useStore } from 'vuex';
import { computed, ref, watchEffect } from "vue";
import { required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { Contact, Group, Member, User } from "src/store/model"
import { useI18n } from "vue-i18n"

const store = useStore()

const myMember = computed(() => store.getters.myMember as Member & {group: Group, contacts: Contact[]})
const myUser = computed(() => store.getters.myUser as User)

const code = computed(() => myMember.value?.group?.attributes.code)
const memberCode = computed(() => myMember.value?.attributes.code)

const image = ref<string|null>(null)
const name = ref<string>('')
const description = ref<string>('')
const email = ref<string>('')
const location = ref<[number, number] | undefined>()
const address = ref<string>('')
const postalCode = ref<string>('')
const city = ref<string>('')
const region = ref<string>('')
const country = ref<string | null>(null)

watchEffect( () => {
  const member = myMember.value?.attributes;
  image.value = member.image ?? null
  name.value = member.name
  description.value =  member.description
  location.value = member.location.coordinates
  address.value = member.address.streetAddress
  postalCode.value = member.address.postalCode
  city.value = member.address.addressLocality
  region.value = member.address.addressRegion
  country.value = member.address.addressCountry ?? null
})

watchEffect(() => {
  const user = myUser.value?.attributes;
  email.value = user.email;
})

// Form validation
const rules = {
  name: { required },
  email: { required },
  postalCode: { required },
  city: { required },
  region: { required },
  country: { required },  
}
const v$ = useVuelidate(rules, {name, email, postalCode, city, region, country})

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

</script>