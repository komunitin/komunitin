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
      <account-header
        v-if="isAdmin && account"
        class="q-mb-md"
        style="margin-left: -16px"
        :account="account"
        to=""
      />

      <div>
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
      <account-settings-fields
        v-if="accountSettings && currency && defaultSettings"
        v-model:settings="accountSettings"
        v-model:credit-limit="creditLimit"
        v-model:maximum-balance="maximumBalance"
        :credit-limit-loading="creditLimitLoading"
        :maximum-balance-loading="maximumBalanceLoading"

        class="q-pt-md"
        :currency="currency"
        :defaults="defaultSettings"
        limits
      />
      <div 
        v-if="effectiveSettings && effectiveSettings.allowTagPayments"
        class="q-mt-lg"
      >
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
import { computed, Ref, ref, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';
import PageHeader from '../../layouts/PageHeader.vue';
import ToggleItem from '../../components/ToggleItem.vue';
import SaveChanges from '../../components/SaveChanges.vue';
import NfcTagsList from '../../components/NfcTagsList.vue';
import AccountHeader from 'src/components/AccountHeader.vue';
import AccountSettingsFields from './AccountSettingsFields.vue';

import langs, {LangName, normalizeLocale} from "../../i18n";
import { AccountSettings, MailingFrequency, AccountTag, UserSettings, Member, Account, Group, Currency, CurrencySettings } from '../../store/model';
import { DeepPartial } from 'quasar';
import { useLocale } from "../../boot/i18n"
import { watchDebounced } from "@vueuse/shared";
import { useI18n } from 'vue-i18n';
import { currencySettingsToAccountSettingsAttributes, useEffectiveSettings } from 'src/composables/accountSettings';
import { useFullMemberByCode } from 'src/composables/fullMember';

const props = defineProps<{
  code?: string,
  memberCode?: string
}>()

const store = useStore()

const isAdmin = computed(() => store.getters.isAdmin)

// Load member & user.
const {user, member} = useFullMemberByCode(() => props.code, () => props.memberCode)

const userSettings = computed(() => user.value?.settings)

const code = computed(() => (member.value as (Member & {group: Group}))?.group.attributes.code)
const memberCode = computed(() => member.value?.attributes.code)

// Load account and settings
const account = ref<Account & {settings: AccountSettings, currency: Currency & {settings: CurrencySettings}}>()
// These are the settings model and not need to be in always in sync with the account.settings
const accountSettings = ref<AccountSettings>()

watch(member, async (member) => {
  if (member) {
    await store.dispatch("accounts/load", {
      id: member.relationships.account.data.id,
      group: code.value,
      include: "settings,currency,currency.settings"
    })
    account.value = store.getters["accounts/current"]
    accountSettings.value = account.value?.settings
  }
}, {immediate: true})

const currency = computed(() => account.value?.currency)
const currencySettings = computed(() => currency.value?.settings)

const defaultSettings = computed(() => {
  if (currencySettings.value) {
    return {
      attributes: currencySettingsToAccountSettingsAttributes(currencySettings.value)
    }
  } else {
    return undefined
  }
})

const userLanguage = computed(() => {
  const lang = userSettings.value?.attributes.language
  return lang ? normalizeLocale(lang) : undefined
})

const { t } = useI18n()
const frequencies = [
  {label: t('daily'), value: 'daily'},
  {label: t('weekly'), value: 'weekly'},
  {label: t('monthly'), value: 'monthly'},
  {label: t('quarterly'), value: 'quarterly'},
  {label: t('never'), value: 'never'}
] as const

const langOptions = computed(() => {
  return (Object.keys(langs) as LangName[]).map((lang: LangName) => ({label: langs[lang].label, value: lang}))
})

const changes = ref<typeof SaveChanges>()

const saveAccountSettings = async (resource: DeepPartial<AccountSettings>) => {
  const fn = () => store.dispatch("account-settings/update", {
    id: account.value?.id,
    group: code.value,
    resource
  })
  await changes.value?.save(fn)
}

const saveUserSettings = async (resource: DeepPartial<UserSettings>) => {
  const fn = () => store.dispatch("user-settings/update", {
    id: user.value?.id,
    group: code.value,
    resource
  })
  await changes.value?.save(fn)
}

// Account settings
const tags = ref()
watchEffect(() => {
  tags.value = accountSettings.value?.attributes.tags ?? undefined
})

const tagsEqual = (a: AccountTag[], b?: AccountTag[] | null) => {
  if (!b) {
    return a.length === 0
  }
  if (a.length !== b.length) {
    return false
  }
  return a.every((tag, i) => tag.id === b[i].id)
}

const settingsEqual = (a: AccountSettings, b: AccountSettings) => {
  const keys = Array.from(new Set([...Object.keys(a.attributes), ...Object.keys(b.attributes)]))
    .filter(key => key !== "tags") as (keyof AccountSettings["attributes"])[]
  return !keys.some((key) => a.attributes[key] !== b.attributes[key])
}

watch([accountSettings, tags], async () => {
  let save = false
  let attributes: Partial<AccountSettings["attributes"]> = {}
  
  if (tags.value !== undefined && !tagsEqual(tags.value, account.value?.settings.attributes.tags)) {
    attributes.tags = tags.value
    save = true
  }
  if (accountSettings.value && account.value && !settingsEqual(accountSettings.value, account.value.settings)) {
    attributes = {
      ...accountSettings.value.attributes,
      ...attributes, // overwrite tags.
    }
    save = true
  }
  if (save) {
    await saveAccountSettings({ attributes })
  }
})

// Credit limit & maximum balance
const saveAccount = async (resource: DeepPartial<Account>, loading: Ref<boolean>) => {
  try {
    loading.value = true
    const fn = () => store.dispatch("accounts/update", {
      id: account.value?.id,
      group: code.value,
      resource
    })
    await changes.value?.save(fn)
  } finally {
    loading.value = false
  }
}

const creditLimit = ref<number>()
const creditLimitLoading = ref<boolean>(false)

watch(creditLimit, async () => {
  if (creditLimit.value !== account.value?.attributes.creditLimit) {
    await saveAccount({attributes: {creditLimit: creditLimit.value}}, creditLimitLoading)
  }
})

const maximumBalance = ref<number>()
const maximumBalanceLoading = ref<boolean>(false)

watch(account, () => {
  if (account.value) {
    creditLimit.value = account.value.attributes.creditLimit
    maximumBalance.value = account.value.attributes.maximumBalance ? account.value?.attributes.maximumBalance : 0
  }
})

watch(maximumBalance, async () => {
  if (maximumBalance.value !== account.value?.attributes.maximumBalance) {
    await saveAccount({
      attributes: {
        maximumBalance: maximumBalance.value == 0 ? false : maximumBalance.value
      }
    }, maximumBalanceLoading)
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

const effectiveSettings = useEffectiveSettings(accountSettings, currencySettings)

</script>