<template>
  <page-header
    :title="$t('groupSettings')" 
  />
  <q-page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg q-px-md col-12 col-sm-8 col-md-6 q-mb-xl"
    >
      <edit-group-settings-form 
        v-if="ready"

        :group-settings="groupSettings"
        :currency="currency"
        :currency-settings="currencySettings"
        :trustlines="trustlines"

        :updating-group-settings="updatingGroupSettings"
        :updating-currency="updatingCurrency"
        :updating-currency-settings="updatingCurrencySettings"
        :updating-trustline="updatingTrustline"
        @update:group-settings="updateGroupSettings"
        @update:currency="updateCurrency"
        @update:currency-settings="updateCurrencySettings"
        @update:trustline="updateTrustline"
        @create:trustline="createTrustline"
      />
      <save-changes
        ref="changes"
        class="q-mt-lg"
      />
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import PageHeader from 'src/layouts/PageHeader.vue';
import EditGroupSettingsForm from './EditGroupSettingsForm.vue';
import SaveChanges from 'src/components/SaveChanges.vue';

import { computed, onMounted, Ref, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { DeepPartial } from 'quasar';
import { Currency, CurrencySettings, GroupSettings, ResourceIdentifierObject, ResourceObject, Trustline } from 'src/store/model';
import { CreatePayload, UpdatePayload } from 'src/store/resources';
import { ExtendedTrustline } from './TrustlinesField.vue';

const props = defineProps<{
  code: string
}>()

const store = useStore()

const load = async () => {
  await Promise.all([
    store.dispatch('groups/load', {
      id: props.code,
      include: 'settings'
    }),
    store.dispatch('currencies/load', {
      id: props.code,
      include: "settings"
    }),
    store.dispatch('trustlines/loadList', {
      group: props.code,
      include: 'trusted'
    })
  ])
  // Load group resources for trusted currencies
  const currency = store.getters['currencies/current']
  const codes = currency.trustlines.map((t: ExtendedTrustline) => t.trusted.attributes.code)
  await store.dispatch('groups/loadList', {
    filter: {code: codes},
  })
}

// We need to build the objects directly from the store getters 
// (instead of "group.currency" etc) so they are reactive
const group = computed(() => store.getters['groups/current'])
const groupSettings = computed(() => store.getters['group-settings/one'](group.value.settings.id))
const currency = computed(() => store.getters['currencies/one'](group.value.currency.id))
const currencySettings = computed(() => store.getters['currency-settings/one'](currency.value.settings.id))
const trustlines = computed(() => store.getters['trustlines/currentList'])


const ready = computed(() => 
  group.value && groupSettings.value && currency.value && currencySettings.value && trustlines.value
)


onMounted(load)
watch(() => props.code, load)

const changes = ref<typeof SaveChanges>()

const updatingGroupSettings = ref(false)
const updatingCurrency = ref(false)
const updatingCurrencySettings = ref(false)
const updatingTrustline = ref(false)

const updateResource = async <T extends ResourceObject>(action: string, payload: UpdatePayload<T> | CreatePayload<T>, updating: Ref<boolean>) => {
  const fn = async () => {
    updating.value = true
    try {
      await store.dispatch(action, payload)
    } finally {
      updating.value = false
    }
  }
  await changes.value?.save(fn)
}

const updateGroupSettings = async (settings: DeepPartial<GroupSettings> & ResourceIdentifierObject) => {
  await updateResource<GroupSettings>('group-settings/update', {
    id: props.code,
    group: props.code,
    resource: settings
  }, updatingGroupSettings)
}

const updateCurrency = async (currency: DeepPartial<Currency> & ResourceIdentifierObject) =>  {
  await updateResource('currencies/update', {
    id: props.code,
    group: props.code,
    resource: currency
  }, updatingCurrency)
}

const updateCurrencySettings = async (settings: DeepPartial<CurrencySettings> & ResourceIdentifierObject) => {
  await updateResource('currency-settings/update', {
    id: props.code,
    group: props.code,
    resource: settings
  }, updatingCurrencySettings)
}

const updateTrustline = async (trustline: DeepPartial<Trustline> & ResourceIdentifierObject) => {
  await updateResource('trustlines/update', {
    id: trustline.id as string,
    group: props.code,
    resource: trustline
  }, updatingTrustline)
}

const createTrustline = async (trustline: DeepPartial<Trustline>) => {
  await updateResource('trustlines/create', {
    group: props.code,
    resource: trustline
  }, updatingTrustline)
  // update trustlines list
  await store.dispatch('trustlines/loadList', {
    group: props.code,  
  })
}
</script>