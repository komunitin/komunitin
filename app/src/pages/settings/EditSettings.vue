<template>
  <page-header 
    :title="$t('settings')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}`"
  />
  <q-page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg q-px-md col-12 col-sm-8 col-md-6"
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
      <div v-if="accountSettings?.attributes.allowNfcTagPayments">
        <div class="text-overline text-uppercase text-onsurface-m q-mb-sm">
          {{ $t('nfcTags') }}
        </div>
        <div class="text-body2 text-onsurface-m q-mb-sm">
          {{ $t('nfcTagsText') }}
        </div>
        <nfc-tags-list
          v-model="tags"
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
      <div class="q-mt-lg">
        <div class="text-overline text-uppercase text-onsurface-m text-bold">
          {{ $t('emails') }}
        </div>
        <div class="text-body2 text-onsurface-m q-mb-sm">
          {{ $t('emailsSettingsText') }}
        </div>
        <q-list>
          <toggle-item 
            v-model="emailMyAccount"
            :label="$t('myAccountEmails')"
            :hint="$t('myAccountEmailsHint')"
          />
          <q-select
            v-show="false"  
            v-model="emailGroup"
            outlined
            emit-value
            map-options
            :options="frequencies"
            :label="$t('groupEmails')"
            :hint="$t('groupEmailsHint')"
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
import NfcTagsList from '../../components/NfcTagsList.vue';

import langs, {LangName, normalizeLocale} from "../../i18n";
import { AccountSettings, MailingFrequency, NFCTag, UserSettings } from '../../store/model';
import { DeepPartial } from 'quasar';
import { useLocale } from "../../boot/i18n"
import { watchDebounced } from "@vueuse/shared";
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const frequencies = [
  {label: t('daily'), value: 'daily'},
  {label: t('weekly'), value: 'weekly'},
  {label: t('monthly'), value: 'monthly'},
  {label: t('quarterly'), value: 'quarterly'},
  {label: t('never'), value: 'never'}
] as const

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
    id: myAccount.value.id,
    group: myAccount.value.currency.attributes.code
  })
}

const loadUserSettings = async () => {
  await store.dispatch("user-settings/load", {
    id: myMember.value.attributes.code,
    group: myMember.value.group.attributes.code
  })
}

onMounted(async () => Promise.all([loadAccountSettings(), loadUserSettings()]))

const changes = ref<typeof SaveChanges>()

const saveAccountSettings = async (resource: DeepPartial<AccountSettings>) => {
  const fn = () => store.dispatch("account-settings/update", {
    id: myAccount.value.id,
    group: myAccount.value.currency.attributes.code,
    resource
  })
  changes.value?.save(fn)
}

const saveUserSettings = async (resource: DeepPartial<UserSettings>) => {
  const fn = () => store.dispatch("user-settings/update", {
    id: myMember.value.attributes.code,
    group: myMember.value.group.attributes.code,
    resource
  })
  changes.value?.save(fn)
}

// Account settings
const acceptPayments = ref<boolean|undefined>()
const tags = ref()
watchEffect(() => {
  acceptPayments.value = accountSettings.value?.attributes.acceptPaymentsAutomatically
  tags.value = accountSettings.value?.attributes.nfcTags
})

const tagsEqual = (a: NFCTag[], b?: NFCTag[]) => {
  if (!b) {
    return a.length === 0
  }
  if (a.length !== b.length) {
    return false
  }
  return a.every((tag, i) => tag.name === b[i].name && tag.tag === b[i].tag)
}

watch([acceptPayments, tags], async () => {
  let save = false
  const attributes: Partial<AccountSettings["attributes"]> = {}
  if (acceptPayments.value !== undefined && acceptPayments.value !== accountSettings.value?.attributes.acceptPaymentsAutomatically) {
    attributes.acceptPaymentsAutomatically = acceptPayments.value
    save = true
  }
  if (tags.value !== undefined && !tagsEqual(tags.value, accountSettings.value?.attributes.nfcTags)) {
    attributes.nfcTags = tags.value
    save = true
  }
  if (save) {
    await saveAccountSettings({ attributes })
  }
})


// User settings

const language = ref()

const notiMyAccount = ref<boolean>()
const notiNeeds = ref<boolean>()
const notiOffers = ref<boolean>()
const notiMembers = ref<boolean>()

const emailMyAccount = ref<boolean>()
const emailGroup = ref<MailingFrequency>()

watchEffect(() => {
  const lang = userLanguage.value
  language.value = lang ? {label: langs[lang].label, value: lang} : undefined
  
  const notifications = userSettings.value?.attributes.notifications
  notiMyAccount.value = notifications?.myAccount
  notiNeeds.value = notifications?.newNeeds
  notiOffers.value = notifications?.newOffers
  notiMembers.value = notifications?.newMembers

  const emails = userSettings.value?.attributes.emails
  emailMyAccount.value = emails?.myAccount
  emailGroup.value = emails?.group
})

const locale = useLocale()

watchDebounced([language, notiMyAccount, notiNeeds, notiOffers, notiMembers, emailMyAccount, emailGroup], () => {
  const notis = userSettings.value?.attributes.notifications  
  const emails = userSettings.value?.attributes.emails
  if (language.value !== undefined && language.value.value !== userLanguage.value
    || notiMyAccount.value !== undefined && notiMyAccount.value !== notis?.myAccount
    || notiNeeds.value !== undefined && notiNeeds.value !== notis?.newNeeds
    || notiOffers.value !== undefined && notiOffers.value !== notis?.newOffers
    || notiMembers.value !== undefined && notiMembers.value !== notis?.newMembers
    || emailMyAccount.value !== undefined && emailMyAccount.value !== emails?.myAccount
    || emailGroup.value !== undefined && emailGroup.value !== emails?.group) {
    saveUserSettings({
      attributes: {
        language: language.value.value,
        notifications: {
          myAccount: notiMyAccount.value,
          newNeeds: notiNeeds.value,
          newOffers: notiOffers.value,
          newMembers: notiMembers.value
        },
        emails: {
          myAccount: emailMyAccount.value,
          group: emailGroup.value
        }
      }
    })
    // This triggers a language app update.
    locale.value = language.value.value
  }
}, {debounce: 1000})

</script>