<template>
  <page-header 
    :title="$t('settings')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}`"
  />
  <q-page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <div>
        <div class="text-overline text-uppercase text-onsurface-m q-mb-sm">
          {{ $t('account') }}
        </div>
        <toggle-item 
          v-model="acceptPayments"
          :label="$t('acceptPayments')"
          :hint="$t('acceptPaymentsHint')"
        />
      </div>
      <div class="q-mt-lg">
        <div class="text-overline text-uppercase text-onsurface-m q-mb-sm">
          {{ $t('app') }}
        </div>
        <q-select
          v-model="language"
          outlined
          :options="langOptions"
          :label="$t('language')"
        />
      </div>
      <div class="q-mt-lg">
        <div class="text-overline text-uppercase text-onsurface-m text-bold">
          {{ $t('notifications') }}
        </div>
        <div class="text-body2 text-onsurface-m q-mb-sm">
          {{ $t('notificationsSettingsText') }}
        </div>
        <q-list>
          <toggle-item 
            v-model="notiMyAccount"
            :label="$t('myAccountNotifications')"
            :hint="$t('myAccountNotificationsHint')"
          />
          <toggle-item 
            v-model="notiNeeds"
            :label="$t('needsNotifications')"
          />
          <toggle-item 
            v-model="notiOffers"
            :label="$t('offersNotifications')"
          />
          <toggle-item 
            v-model="notiMembers"
            :label="$t('membersNotifications')"
          />
        </q-list>
      </div>
      <save-changes
        ref="changes"
        class="q-mt-lg"
      />
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';
import PageHeader from '../../layouts/PageHeader.vue';
import ToggleItem from '../../components/ToggleItem.vue';
import SaveChanges from '../../components/SaveChanges.vue';

import langs, {LangName, normalizeLocale} from "../../i18n";
import { AccountSettings, UserSettings } from '../../store/model';
import { DeepPartial } from 'quasar';
import { useLocale } from "../../boot/i18n"
import { watchDebounced } from "@vueuse/shared";

const store = useStore()

const code = computed(() => {
  return store.getters["myMember"].group.attributes.code
})
const memberCode = computed(() => {
  return store.getters["myMember"].attributes.code
})
const langOptions = computed(() => {
  return (Object.keys(langs) as LangName[]).map((lang: LangName) => ({label: langs[lang].label, value: lang}))
})

const myAccount = computed(() => store.getters["myAccount"])
const myMember = computed(() => store.getters["myMember"])
const userSettings = computed(() => store.getters["user-settings/current"] as UserSettings | undefined)
const userLanguage = computed(() => {
  const lang = userSettings.value?.attributes.language
  return lang ? normalizeLocale(lang) : undefined
})
const accountSettings = computed(() => store.getters["account-settings/current"] as AccountSettings | undefined )

const loadAccountSettings = async () => {
  await store.dispatch("account-settings/load", {
    code: myAccount.value.attributes.code,
    group: myAccount.value.currency.attributes.code
  })
}

const loadUserSettings = async () => {
  await store.dispatch("user-settings/load", {
    code: myMember.value.attributes.code,
    group: myMember.value.group.attributes.code
  })
}

onMounted(async () => Promise.all([loadAccountSettings(), loadUserSettings()]))

const changes = ref<typeof SaveChanges>()

const saveAccountSettings = async (resource: DeepPartial<AccountSettings>) => {
  const fn = () => store.dispatch("account-settings/update", {
    code: myAccount.value.attributes.code,
    group: myAccount.value.currency.attributes.code,
    resource
  })
  changes.value?.save(fn)
}

const saveUserSettings = async (resource: DeepPartial<UserSettings>) => {
  const fn = () => store.dispatch("user-settings/update", {
    code: myMember.value.attributes.code,
    group: myMember.value.group.attributes.code,
    resource
  })
  changes.value?.save(fn)
}

// Account settings
const acceptPayments = ref<boolean|undefined>()
watchEffect(() => {
  acceptPayments.value = accountSettings.value?.attributes.acceptPaymentsAutomatically
})

watch([acceptPayments], () => {
  if (acceptPayments.value !== undefined && acceptPayments.value !== accountSettings.value?.attributes.acceptPaymentsAutomatically) {
    saveAccountSettings({
      attributes: {acceptPaymentsAutomatically: acceptPayments.value}
    })
  }
})

// User settings
const language = ref()
const notiMyAccount = ref()
const notiNeeds = ref()
const notiOffers = ref()
const notiMembers = ref()

watchEffect(() => {
  const lang = userLanguage.value
  language.value = lang ? {label: langs[lang].label, value: lang} : undefined
  const notifications = userSettings.value?.attributes.notifications
  notiMyAccount.value = notifications?.myAccount
  notiNeeds.value = notifications?.newNeeds
  notiOffers.value = notifications?.newOffers
  notiMembers.value = notifications?.newMembers
})

const locale = useLocale()

watchDebounced([language, notiMyAccount, notiNeeds, notiOffers, notiMembers], () => {
  const notis = userSettings.value?.attributes.notifications  
  if (language.value !== undefined && language.value.value !== userLanguage.value
    || notiMyAccount.value !== undefined && notiMyAccount.value !== notis?.myAccount
    || notiNeeds.value !== undefined && notiNeeds.value !== notis?.newNeeds
    || notiOffers.value !== undefined && notiOffers.value !== notis?.newOffers
    || notiMembers.value !== undefined && notiMembers.value !== notis?.newMembers) {
    saveUserSettings({
      attributes: {
        language: language.value.value,
        notifications: {
          myAccount: notiMyAccount.value,
          newNeeds: notiNeeds.value,
          newOffers: notiOffers.value,
          newMembers: notiMembers.value
        }      
      }
    })
    // This triggers a language app update.
    locale.value = language.value.value
  }
}, {debounce: 1000})

</script>