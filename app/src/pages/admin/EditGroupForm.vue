<template>
  <div class="q-gutter-y-lg">
    <div>
      <div class="text-subtitle1">
        {{ $t('group') }}
      </div>
      <div class="text-onsurface-m">
        {{ $t('editGroupText') }}
      </div>
    </div>
    <avatar-field
      v-model="image"
      :text="name"
    />
    <q-input
      v-model="name"
      type="text"
      :label="$t('groupName')"
      outlined
      required
    />
    <q-input
      v-model="code"
      type="text"
      :label="$t('groupCode')"
      :hint="$t('groupCodeHint')"
      mask="XXXX"
      outlined
      required
      :disable="props.op === 'edit'"
    />
    <q-input 
      v-model="description"
      type="textarea"
      :label="$t('description')"
      :hint="$t('descriptionHint')"
      outlined 
      autogrow 
      input-style="min-height: 100px;"
    />
    <div>
      <location-picker 
        v-model="location"
        :default-location="[0, 0]"
        :zoom="1"
      />
    </div>
    <q-input
      v-model="city"
      type="text"
      :label="$t('city')"
      outlined
      required
    />
    <q-input
      v-model="region"
      type="text"
      name="region"
      :label="$t('region')"
      outlined
      required
    />
    <country-chooser
      v-model="country"
      :label="$t('country')"
      outlined
      required
    />
    <member-contacts-field v-model="contacts" />
    <div>
      <div class="text-subtitle1">
        {{ $t('currency') }}
      </div>
      <div class="text-onsurface-m">
        {{ $t('editCurrencyText') }}
      </div>
    </div>
    <q-input
      v-model="currencyName"
      type="text"
      :label="$t('currencyName')"
      outlined
      required
    />
    <q-input
      v-model="currencyNamePlural"
      type="text"
      :label="$t('currencyNamePlural')"
      outlined
      required
    />
    <q-input
      v-model="currencySymbol"
      type="text"
      :label="$t('currencySymbol')"
      outlined
      required
      :rules="[(val: string) => val.length > 0 && val.length <= 3 || $t('invalidValue')]"
    />
    <q-input
      v-model="decimals"
      type="number"
      :label="$t('decimals')"
      outlined
      required
      :rules="[(val: number) => val >= 0 && val <= 6 || $t('invalidValue')]"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue"
import AvatarField from "src/components/AvatarField.vue"
import LocationPicker from "src/components/LocationPicker.vue"
import CountryChooser from "src/components/CountryChooser.vue"
import MemberContactsField, { PartialContact } from "src/components/MemberContactsField.vue"
import { Currency, Group } from "src/store/model"
import { watchDebounced } from "@vueuse/shared"

const props = defineProps<{
  op: "edit" | "create"
  group: Group
  contacts: PartialContact[]
  currency: Currency
}>()

const emit = defineEmits<{
  (e: "update:group", group: Group): void,
  (e: "update:contacts", contacts: PartialContact[]): void,
  (e: "update:currency", currency: Currency): void
}>()

const image = ref(props.group.attributes.image ?? "")
const name = ref(props.group.attributes.name ?? "")
const code = ref(props.group.attributes.code ?? "")
const description = ref(props.group.attributes.description ?? "")
const location = ref(props.group.attributes.location?.coordinates ?? null)

const city = ref(props.group.attributes.address?.addressLocality ?? "")
const region = ref(props.group.attributes.address?.addressRegion ?? "")
const country = ref(props.group.attributes.address?.addressCountry ?? "")

const contacts = ref(props.contacts)

const currencyName = ref(props.currency.attributes.name ?? "")
const currencyNamePlural = ref(props.currency.attributes.namePlural ?? "")
const currencySymbol = ref(props.currency.attributes.symbol ?? "")
const decimals = ref(props.currency.attributes.decimals ?? 2)

watchDebounced([image, name, code, description, location, city, region, country], () => {
  emit('update:group', {
    ...props.group,
    attributes: {
      ...props.group.attributes,
      image: image.value,
      name: name.value,
      code: code.value,
      description: description.value,
      location: {
        type: "Point",
        coordinates: location.value
      },
      address: {
        addressLocality: city.value,
        addressRegion: region.value,
        addressCountry: country.value
      }
    }
  } as Group)
})

watch([contacts], () => {
  emit('update:contacts', contacts.value)
})

watchDebounced([currencyName, currencyNamePlural, currencySymbol, decimals], () => {
  emit('update:currency', {
    ...props.currency,
    attributes: {
      ...props.currency.attributes,
      name: currencyName.value,
      namePlural: currencyNamePlural.value,
      symbol: currencySymbol.value,
      decimals: decimals.value
    }
  } as Currency)
})


</script>