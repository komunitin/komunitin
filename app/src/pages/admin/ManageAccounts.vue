<template>
  <page-header
    :title="$t('manageAccounts')"   
  />
  <q-page-container class="row justify-start">
    <q-page 
      padding 
      class="q-pa-lg"
    > 
      <div class="text-onsurface-m">
        {{ $t('manageAccountsText') }}
      </div>
      <q-table
        ref="tableRef"
        v-model:pagination="pagination"
        :filter="filter"
        class="full-width text-onsurface q-pt-lg"
        :columns="columns"
        :rows="accounts"
        :visible-columns="visibleColumns"
        :rows-per-page-options="[10,25,50,100,200]"
        :loading="loading"
        :fullscreen="isFullscreen"
        flat
        @request="load"
        @row-click="(_, row) => accountClick(row)"
      >
        <template #top>
          <div class="full-width row justify-between items-center">
            <q-input
              v-model="filter"
              debounce="300"
              :placeholder="$t('search')"
              outlined
              dense
              style="min-width: 200px"
            >
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
            <div class="row q-gutter-x-md">
              <q-select
                v-model="visibleColumns"
                multiple
                :options="visibleColumnsOptions"
                emit-value
                map-options
                option-value="name"
                :display-value="$t('columns')"
                outlined
                dense
                options-cover
                style="min-width: 200px"
              >
                <template #option="scope">
                  <q-item
                    v-bind="scope.itemProps"
                    clickable
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.label }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        v-if="scope.selected"
                        name="check"
                        color="primary"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-btn
                flat
                dense
                round
                :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="isFullscreen = !isFullscreen"
              />
            </div>
          </div>
        </template>
        <template #pagination="scope">
          <q-btn
            icon="chevron_left"
            flat
            dense
            round
            :disable="scope.isFirstPage"
            @click="scope.prevPage"
          />
          <q-btn
            icon="chevron_right"
            flat
            dense
            round
            :disable="scope.isLastPage"
            @click="scope.nextPage"
          />
        </template>
        <template #body-cell-image="scope">
          <q-td 
            :props="scope"
            style="padding-right: 0;"
          >
            <avatar
              :img-src="scope.row.member.attributes.image"
              :text="scope.row.member.attributes.name"
              size="40px"
            />
          </q-td>
        </template>
        <template #body-cell-actions="scope">
          <q-td :props="scope">
            <q-btn
              flat
              dense
              round
              color="icon-dark"
              icon="edit"
              :to="{name: 'AdminEditProfile', params: {code: scope.row.member.group.attributes.code, memberCode: scope.row.member.attributes.code}}"
            />
            <q-btn
              flat
              dense
              round
              color="icon-dark"
              icon="settings"
              :to="{name: 'AdminEditSettings', params: {code: scope.row.member.group.attributes.code, memberCode: scope.row.member.attributes.code}}" 
            />
          </q-td>
        </template>
      </q-table>
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import { QTable } from 'quasar';
import PageHeader from 'src/layouts/PageHeader.vue';
import Avatar from 'src/components/Avatar.vue';
import { Account, AccountSettings, CurrencySettings, Group, Member } from 'src/store/model';
import { LoadListPayload } from 'src/store/resources';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import formatCurrency from 'src/plugins/FormatCurrency';
import { useRouter } from 'vue-router';


const props = defineProps<{
  code: string
}>()

const { t } = useI18n()
const store = useStore()

const settingsKeys = [
  'allowPayments',
  'allowPaymentRequests',
  'allowSimplePayments',
  'allowSimplePaymentRequests',
  'allowQrPayments',
  'allowQrPaymentRequests',
  'allowMultiplePayments',
  'allowMultiplePaymentRequests',
  'allowTagPayments',
  'allowTagPaymentRequests',
  'acceptPaymentsAutomatically',
  'enableAcceptPaymentsAfter2w',
  'allowExternalPayments',
  'allowExternalPaymentRequests',
  'acceptExternalPaymentsAutomatically',
  'onPaymentCreditLimit',
  'nfcTags'
]

store.dispatch('currencies/load', {
  id: props.code,
  include: 'settings'
})
store.dispatch('groups/load', {
  id: props.code,
  include: 'settings'
})

const currency = computed(() => store.getters['currencies/current'])
const currencySettings = computed(() => currency.value?.settings)
const group = computed(() => store.getters['groups/current'])

const formatAmount = (amount: number) => formatCurrency(amount, currency.value)

type ExtendedAccount = Account & {settings: AccountSettings, member: Member}
const columns = [
  {name: 'image', field: (a: ExtendedAccount) => a.member.attributes.image, label: '', align: 'center', required: true},
  {name: 'code', field: (a: ExtendedAccount) => a.attributes.code, label: t('account'), align: 'left', required: true, sortable: true},  
  {name: 'name', field: (a: ExtendedAccount) => a.member.attributes.name, label: t('name'), align: 'left', required: true, sortable: true},
  {name: 'state', field: (a: ExtendedAccount) => a.member.attributes.state, label: t('state'), align: 'left'},
  {name: 'balance', field: (a: ExtendedAccount) => a.attributes.balance, label: t('balance'), align: 'right', sortable: true, format: formatAmount},
  // Account limits
  {name: 'creditLimit', field: (a: ExtendedAccount) => a.attributes.creditLimit, label: t('creditLimit'), align: 'right', sortable: true, format: formatAmount},
  {name: 'maximumBalance', field: (a: ExtendedAccount) => a.attributes.maximumBalance, label: t('maximumBalance'), align: 'right', sortable: true, format: formatAmount},
  // Account settings
  ...settingsKeys.map(key => {
    const settingsField = (key: string) => {
      if (key === 'enableAcceptPaymentsAfter2w') {
        return (a: ExtendedAccount) => a.settings.attributes.acceptPaymentsAfter !== undefined 
          ? (!!a.settings.attributes.acceptPaymentsAfter) : undefined
      } else if (key === 'nfcTags') {
        return (a: ExtendedAccount) => a.settings.attributes.tags?.length
      } else {
        return (a: ExtendedAccount) => a.settings.attributes[key as keyof AccountSettings["attributes"]]
      }
    }
    const settingsValue = (key: string, value: number|boolean|undefined, currencySettings: CurrencySettings) => {
      if (value === undefined) {
        const defaultKey = "default" + key.charAt(0).toUpperCase() + key.slice(1) as keyof CurrencySettings["attributes"]
        return currencySettings.attributes[defaultKey] ?? false
      }
      return value
    }
    const settingsFormat = (key: string) => {
      if (key === "onPaymentCreditLimit") {
        return (a: number | undefined) => formatAmount(settingsValue(key, a, currencySettings.value) as number)
      } else if (key === "nfcTags") {
        return undefined
      } else {
        // This is a special boolean. If set to true or false, we'll set a checkmark or a cross.
        // If undefined, we'll set a greyed checkmark or cross depending on the default value.
        return (a: boolean | undefined) => settingsValue(key, a, currencySettings.value) ? "\u2714" : "\u2718"
      }
    }
    const settingsClasses = (key: string) => {
      if (!["nfcTags"].includes(key)) {
        return (account: ExtendedAccount) =>  {
          const setting = account.settings.attributes[key as keyof AccountSettings["attributes"]]
          if (setting === undefined) {
            return 'text-onsurface-d'
          } else if (typeof setting === 'boolean') {
            return setting ? 'text-positive' : 'text-negative'
          } else {
            return 'text-onsurface'
          }
        }
      }
      return undefined
    }
      
    return {
      name: key,
      field: settingsField(key),
      label: t(key),
      align: 'center',
      format: settingsFormat(key),
      classes: settingsClasses(key)
    }
  }),
  {name: 'actions', label: '', align: 'right', required: true}
]

const visibleColumnsOptions = columns.filter(c => !('required' in c) || !c.required)
const visibleColumns = ref(['state', 'balance', 'creditLimit', 'maximumBalance'])
const isFullscreen = ref(false)

type Pagination = {
  sortBy: string
  descending: boolean
  page: number
  rowsPerPage: number
  rowsNumber: number
}

const pagination = ref({
  sortBy: 'code',
  descending: false,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

watch(group, () => {
  if (group.value) {
    pagination.value.rowsNumber = group.value.relationships.members.meta.count
  }
}, {immediate: true})

const filter = ref('')

const loading = ref(true)
const accounts = ref([])

const load = async (scope: {pagination: Pagination, filter?: string}) => {  
  loading.value = true
  const { rowsPerPage, sortBy, descending, page } = scope.pagination
  const sortField = sortBy ?? "code"
  // If the sortBy is null, don't explicitly sort (we'll implicitly sort by code)
  const sort = sortBy ? (descending ? "-" : "") + sortField : undefined
  const group = props.code
  const pageSize = rowsPerPage
  
  try {
    // Since data is splitted in two APIs, we need to call first the one that sorts the data.
    const socialFields = ['name']
    if (socialFields.includes(sortField) || scope.filter) {
      if (page === 1) {
        await store.dispatch('members/loadList', {
          group,
          sort,
          search: scope.filter ? scope.filter : undefined,
          pageSize
        } as LoadListPayload)
      } else if (page === pagination.value.page + 1) {
        // Next page
        await store.dispatch('members/loadNext', {})
      } else if (page === pagination.value.page - 1) {
        // Previous page
        await store.dispatch('members/loadPrev', {})
      } else {
        throw new Error("Invalid page")
      }
      const loadedMembers = store.getters['members/page'](page - 1)
      // Load accounts related to fetched members
      await store.dispatch('accounts/loadList', {
        group,
        filter: {
          id: loadedMembers.map((member: Member) => member.relationships.account.data.id)
        },
        pageSize,
        include: 'settings',
      })
      accounts.value = loadedMembers.map((member: {account: Account}) => member.account)
    } else {
      if (page === 1) {
        await store.dispatch('accounts/loadList', {
          group,
          sort,
          include: 'settings',
          pageSize
        } as LoadListPayload)
      } else if (page === pagination.value.page + 1) {
        // Next page
        await store.dispatch('accounts/loadNext', {})
      } else if (page === pagination.value.page - 1) {
        // Previous page
        await store.dispatch('accounts/loadPrev', {})
      } else {
        throw new Error("Invalid page")
      }
      // Load members related to fetched accounts
      const loadedAccounts = store.getters['accounts/page'](page - 1)
      await store.dispatch("members/loadList", {
        group: props.code,
        filter: {
          account: loadedAccounts.map((account: Account) => account.id)
        },
        pageSize,
      })
      accounts.value = loadedAccounts
    }
    // Update the pagination object
    pagination.value = {
      ...pagination.value,
      sortBy,
      descending,
      page,
      rowsPerPage
    }
  } finally {
    loading.value = false
  }
}

const tableRef = ref<QTable>()

onMounted(() => {
  tableRef.value?.requestServerInteraction()
})

const router = useRouter()
const accountClick = (account: ExtendedAccount) => {
  router.push({name: 'Member', params: {
    code: (account.member as Member & {group: Group}).group.attributes.code,
    memberCode: account.member.attributes.code
  }})
}


</script>