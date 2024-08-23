<template>
  <div class="q-gutter-y-lg">
    <div>
      <div class="text-subtitle1">
        {{ $t('signupSettings') }}
      </div>
      <div class="text-onsurface-m">
        {{ $t('signupSettingsText') }}
      </div>
    </div>
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('termsOfUse') }}
    </div>
    <toggle-item
      v-model="requireAcceptTerms"
      :label="$t('enableTermsOfUse')"
      :hint="$t('enableTermsOfUseHint')"
    />
    <q-input
      v-model="terms"
      type="textarea"
      :label="$t('termsOfUse')"
      outlined
      autogrow
      input-style="min-height: 100px;"
    />
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('offersAndNeeds') }}
    </div>
    <q-input
      v-model.number="minOffers"
      type="number"
      :label="$t('minOffers')"
      :hint="$t('minOffersHint')"
      min="0"
      max="5"
      outlined
    />
    <q-input
      v-model.number="minNeeds"
      type="number"
      :label="$t('minNeeds')"
      :hint="$t('minNeedsHint')"
      min="0"
      max="5"
      outlined
    />
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('accountStart') }}
    </div>
    <amount-input
      v-model="settingsRefs.defaultInitialCreditLimit.value"
      :label="$t('initialCredit')"
      :hint="$t('initialCreditHint')"
      :currency="currency"
      outlined
    />
    <amount-input
      v-model="settingsRefs.defaultInitialMaximumBalance.value"
      :label="$t('maximumBalance')"
      :hint="$t('maximumBalanceHint')"
      :currency="currency"
      outlined
    />
    <q-separator class="q-mt-xl" />
    <div class="q-mt-lg">
      <div class="text-subtitle1">
        {{ $t('accountDefaults') }}
      </div>
      <div class="text-onsurface-m">
        {{ $t('accountDefaultsText') }}
      </div>
    </div>
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('transferDirections') }}
    </div>
    <toggle-item 
      v-model="settingsRefs.defaultAllowPayments.value"
      :label="$t('allowPayments')"
      :hint="$t('allowPaymentsHint')"
    />
    <toggle-item 
      v-model="settingsRefs.defaultAllowPaymentRequests.value"
      :label="$t('allowPaymentRequests')"
      :hint="$t('allowPaymentRequestsHint')"
    />
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('transferMethods') }}
    </div>
    <toggle-item
      v-model="settingsRefs.defaultAllowSimplePayments.value"
      :label="$t('allowSimplePayments')"
      :hint="$t('allowSimplePaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowSimplePaymentRequests.value"
      :label="$t('allowSimplePaymentRequests')"
      :hint="$t('allowSimplePaymentRequestsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowQrPayments.value"
      :label="$t('allowQrPayments')"
      :hint="$t('allowQrPaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowQrPaymentRequests.value"
      :label="$t('allowQrPaymentRequests')"
      :hint="$t('allowQrPaymentRequestsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowTagPayments.value"
      :label="$t('allowTagPayments')"
      :hint="$t('allowTagPaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowTagPaymentRequests.value"
      :label="$t('allowTagPaymentRequests')"
      :hint="$t('allowTagPaymentRequestsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowMultiplePayments.value"
      :label="$t('allowMultiplePayments')"
      :hint="$t('allowMultiplePaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowMultiplePaymentRequests.value"
      :label="$t('allowMultiplePaymentRequests')"
      :hint="$t('allowMultiplePaymentRequestsHint')"
    />
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('paymentRequests') }}
    </div>
    <toggle-item 
      v-model="settingsRefs.defaultAcceptPaymentsAutomatically.value"
      :label="$t('acceptPayments')"
      :hint="$t('acceptPaymentsHint')"
    />
    <toggle-item
      v-model="enableAcceptPaymentsAfter"
      :label="$t('enableAcceptPaymentsAfter2w')"
      :hint="$t('enableAcceptPaymentsAfter2wHint')"
    />
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('limits') }}
    </div>
    <toggle-item
      v-model="enableOnPaymentCreditLimit"
      :label="$t('enableOnPaymentCreditLimit')"
      :hint="$t('enableOnPaymentCreditLimitHint')"
    />
    <amount-input
      v-model="defaultOnPaymentCreditLimitValue"
      :currency="currency"
      :label="$t('onPaymentCreditLimit')"
      outlined
      :disable="!enableOnPaymentCreditLimit"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowExternalPayments.value"
      :label="$t('allowExternalPayments')"
      :hint="$t('allowExternalPaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAllowExternalPaymentRequests.value"
      :label="$t('allowExternalPaymentRequests')"
      :hint="$t('allowExternalPaymentRequestsHint')"
    />
    <toggle-item
      v-model="settingsRefs.defaultAcceptExternalPaymentsAutomatically.value"
      :label="$t('acceptExternalPaymentsAutomatically')"
      :hint="$t('acceptExternalPaymentsAutomaticallyHint')"
    />
    <q-separator />
    <div class="q-mt-lg">
      <div class="text-subtitle1">
        {{ $t('externalPayments') }}
      </div>
      <div class="text-onsurface-m">
        {{ $t('externalPaymentsText') }}
      </div>
    </div>
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('settings') }}
    </div>
    <toggle-item
      v-model="settingsRefs.enableExternalPayments.value"
      :label="$t('enableExternalPayments')"
      :hint="$t('enableExternalPaymentsHint')"
    />
    <toggle-item
      v-model="settingsRefs.enableExternalPaymentRequests.value"
      :label="$t('enableExternalPaymentRequests')"
      :hint="$t('enableExternalPaymentRequestsHint')"
    />
    <input-update
      v-model="currencyValue"
      type="text"
      :label="$t('currencyValue')"
      :hint="$t('currencyValueHint')"
      outlined
      required
      :rules="[(val: string) => val.match(/^\d+(\/\d+)?$/) || $t('invalidCurrencyValue')]"
      hide-bottom-space
      :loading="currencyValueLoading"
    />
    <input-update
      v-model="externalTraderCreditLimit"
      :loading="externalTraderCreditLimitLoading"
    >
      <template #default="{modelValue, updateModelValue}">
        <amount-input
          :model-value="modelValue"
          :currency="currency"
          :label="$t('externalTraderCreditLimit')"
          :hint="$t('externalTraderCreditLimitHint')"
          outlined
          @update:model-value="updateModelValue"
        />
      </template>
    </input-update>
    <input-update
      v-model="externalTraderMaximumBalance"
      :loading="externalTraderMaximumBalanceLoading"
    >
      <template #default="{modelValue, updateModelValue}">
        <amount-input
          :model-value="modelValue"
          :currency="currency"
          :label="$t('externalTraderMaximumBalance')"
          :hint="$t('externalTraderMaximumBalanceHint')"
          outlined
          @update:model-value="updateModelValue"
        />
      </template>
    </input-update>
    <div class="text-overline text-uppercase text-onsurface-m">
      {{ $t('trustlines') }}
    </div>
    <div class="text-onsurface-m">
      {{ $t('trustlinesText') }}
    </div>
    <trustlines-field
      :trustlines="trustlines"
      @update:trustline="$emit('update:trustline', $event)"
      @create:trustline="$emit('create:trustline', $event)"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ToggleItem from 'src/components/ToggleItem.vue';
import InputUpdate from 'src/components/InputUpdate.vue';
import AmountInput from 'src/components/AmountInput.vue';
import TrustlinesField from './TrustlinesField.vue';
import { Group, GroupSettings, Currency, CurrencySettings, Trustline } from 'src/store/model';
import { watchDebounced } from '@vueuse/shared';
import { DeepPartial } from 'quasar';

export type ExtendedGroup = Group & {
  settings: GroupSettings,
  currency: Currency & {
    settings: CurrencySettings,
    trustlines: Trustline[]
  }
}
const props = defineProps<{
  groupSettings: GroupSettings,
  currency: Currency,
  currencySettings: CurrencySettings,
  trustlines: Trustline[],

  updatingGroupSettings: boolean,
  updatingCurrency: boolean,
  updatingCurrencySettings: boolean,
  updatingTrustline: boolean
}>()

const groupSettings = computed(() => props.groupSettings)
const currency = computed(() => props.currency)
const currencySettings = computed(() => props.currencySettings)
const trustlines = computed(() => props.trustlines)

const emit = defineEmits<{
  (e: 'update:group-settings', value: DeepPartial<GroupSettings>): void
  (e: 'update:currency', value: DeepPartial<Currency>): void
  (e: 'update:currency-settings', value: DeepPartial<CurrencySettings>): void
  (e: 'update:trustline', value: DeepPartial<Trustline>): void
  (e: 'create:trustline', value: DeepPartial<Trustline>): void
}>()

// Social API

const requireAcceptTerms = ref(groupSettings.value.attributes.requireAcceptTerms ?? false)
const terms = ref(groupSettings.value.attributes.terms ?? "")
const minOffers = ref(groupSettings.value.attributes.minOffers ?? 0)
const minNeeds = ref(groupSettings.value.attributes.minNeeds ?? 0)

watchDebounced([requireAcceptTerms, terms, minOffers, minNeeds], () => {
  emit('update:group-settings', {
    ...groupSettings.value,
    attributes: {
      requireAcceptTerms: requireAcceptTerms.value,
      terms: terms.value,
      minOffers: minOffers.value,
      minNeeds: minNeeds.value
    }
  } as DeepPartial<GroupSettings>)
})

// Accounting API

// This ref selects the loading spinner
const lastCurrencySettingsUpdate = ref<"rate"|"settings"|"externalTraderCreditLimit"|"externalTraderMaximumBalance">()

// Currency

const currencyValue = ref(currency.value.attributes.rate.n + "/" + currency.value.attributes.rate.d)
const currencyValueLoading = computed(() => lastCurrencySettingsUpdate.value === "rate" && props.updatingCurrency)

watchDebounced(currencyValue, (value) => {
  lastCurrencySettingsUpdate.value = "rate"
  const [n,d] = value.split("/")
  emit('update:currency', {
    ...currency.value,
    attributes: {
      rate: {
        n: parseInt(n),
        d: parseInt(d)
      }
    }
  } as DeepPartial<Currency>)
})

// Currency settings

const vals = currencySettings.value.attributes

const enableOnPaymentCreditLimit = ref(vals.defaultOnPaymentCreditLimit !== undefined)
const defaultOnPaymentCreditLimitValue = ref(vals.defaultOnPaymentCreditLimit ?? 0)

const enableAcceptPaymentsAfter = ref(vals.defaultAcceptPaymentsAfter !== undefined)


const settingsRefs = {
  defaultInitialCreditLimit: ref(vals.defaultInitialCreditLimit ?? 0),
  defaultInitialMaximumBalance: ref(vals.defaultInitialMaximumBalance ?? 0),
  defaultAllowPayments: ref(vals.defaultAllowPayments ?? false),
  defaultAllowPaymentRequests: ref(vals.defaultAllowPaymentRequests ?? false),
  defaultAcceptPaymentsAutomatically: ref(vals.defaultAcceptPaymentsAutomatically ?? false),
  defaultAllowSimplePayments: ref(vals.defaultAllowSimplePayments ?? false),
  defaultAllowSimplePaymentRequests: ref(vals.defaultAllowSimplePaymentRequests ?? false),
  defaultAllowQrPayments: ref(vals.defaultAllowQrPayments ?? false),
  defaultAllowQrPaymentRequests: ref(vals.defaultAllowQrPaymentRequests ?? false),
  defaultAllowTagPayments: ref(vals.defaultAllowTagPayments ?? false),
  defaultAllowTagPaymentRequests: ref(vals.defaultAllowTagPaymentRequests ?? false),
  defaultAllowMultiplePayments: ref(vals.defaultAllowMultiplePayments ?? false),
  defaultAllowMultiplePaymentRequests: ref(vals.defaultAllowMultiplePaymentRequests ?? false),
  defaultAcceptPaymentsAfter: computed(() => enableAcceptPaymentsAfter.value ? 2*7*24*60*60 : undefined),
  defaultOnPaymentCreditLimit: computed(() => enableOnPaymentCreditLimit.value ? defaultOnPaymentCreditLimitValue.value : undefined),
  enableExternalPayments: ref(vals.enableExternalPayments ?? false),
  enableExternalPaymentRequests: ref(vals.enableExternalPaymentRequests ?? false),
  defaultAllowExternalPayments: ref(vals.defaultAllowExternalPayments ?? false),
  defaultAllowExternalPaymentRequests: ref(vals.defaultAllowExternalPaymentRequests ?? false),
  defaultAcceptExternalPaymentsAutomatically: ref(vals.defaultAcceptExternalPaymentsAutomatically ?? false),
}

watchDebounced(Object.values(settingsRefs), () => {
  lastCurrencySettingsUpdate.value = "settings"
  const attributes = Object.entries(settingsRefs).reduce((acc, [key, ref]) => {
    acc[key] = ref.value
    return acc
  }, {} as Record<string, number|boolean|undefined>)

  emit('update:currency-settings', {
    id: currencySettings.value.id,
    type: "currency-settings",
    attributes
  })
})

// These two settings are updated separately because they imply a stellar transaction so
// they deserve a different UX (click to, show spinner).
const externalTraderCreditLimit = ref(vals.externalTraderCreditLimit ?? 0)
const externalTraderMaximumBalance = ref(vals.externalTraderMaximumBalance ?? 0)

watch(externalTraderCreditLimit, (value) => {
  lastCurrencySettingsUpdate.value = "externalTraderCreditLimit"
  emit('update:currency-settings', {
    id: currencySettings.value.id,
    type: "currency-settings",
    attributes: {
      externalTraderCreditLimit: value
    }
  })
})


const externalTraderCreditLimitLoading = computed(() => lastCurrencySettingsUpdate.value === "externalTraderCreditLimit" && props.updatingCurrencySettings)

watch(externalTraderMaximumBalance, (value) => {
  lastCurrencySettingsUpdate.value = "externalTraderMaximumBalance"
  emit('update:currency-settings', {
    id: currencySettings.value.id,
    type: "currency-settings",
    attributes: {
      externalTraderMaximumBalance: value
    }
  })
})
const externalTraderMaximumBalanceLoading = computed(() => lastCurrencySettingsUpdate.value === "externalTraderMaximumBalance" && props.updatingCurrencySettings)

</script>
<style lang="scss" scoped>
.text-overline {
  margin-bottom: -16px;
}
</style>