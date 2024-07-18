<template>
  <q-field
    ref="fieldRef"
    v-model="value"
    v-bind="$attrs"
    outlined
    class="cursor-pointer"
  >
    <template #control>
      <member-header
        v-if="value?.member"
        :member="value?.member"
        clickable
      />
      <div
        v-else 
        tabindex="0" 
        @keydown.enter="onClick"
      >
        {{ value?.attributes.code ?? "" }}
      </div>
    </template>
    <template #append>
      <q-icon name="arrow_drop_down" />
    </template>
  </q-field>
  <q-dialog 
    v-model="dialog" 
    :maximized="$q.screen.lt.sm"
    @hide="closeDialog()"
  >
    <q-card
      class="select-member-dialog"
    >
      <q-card-section class="q-px-none">
        <q-toolbar class="text-onsurface-m">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            @click="dialog = false"
          />
          <q-input
            v-model="searchText"
            dense
            outlined
            class="q-mx-md searchbar"
            type="search"
            debounce="250"
            autofocus
          >
            <template #append>
              <q-icon
                v-if="searchText === ''"
                name="search"
              />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchText = ''"
              />
            </template>
          </q-input>
        </q-toolbar>
      </q-card-section>
      <q-separator />
      <q-card-section 
        v-if="selectGroup"
        class="q-pa-none" 
      >
        <select-group
          v-model="group"
          :payer="payer"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <resource-cards
          v-if="listGroupMembers"
          ref="memberItems"
          v-slot="slotProps"
          :code="group.attributes.code"
          module-name="members"
          include="contacts,account"
          :query="searchText"
        >
          <q-list
            v-if="slotProps.resources"
            padding
          >
            <member-header
              v-for="candidate of slotProps.resources"
              :key="candidate.id"
              :member="candidate"
              @click="select(candidate)"
            />
          </q-list>
        </resource-cards>
        <account-code-form
          v-else
          v-model="value"
          :group="group"
          class="q-py-md q-px-xl q-mx-lg"
          @submit="dialog = false"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import MemberHeader from "./MemberHeader.vue"
import SelectGroup from "./SelectGroup.vue"
import AccountCodeForm from "./AccountCodeForm.vue"
import ResourceCards from "../pages/ResourceCards.vue"
import { Account, AccountSettings, Group, Member } from 'src/store/model';
import { QField } from 'quasar';
import { useStore } from 'vuex';

/**
 * Using defineComponent instead of <script setup> because of inheritAttrs. Change that once we update to Vue 3.3+
 */
export default defineComponent({
  components: {
    MemberHeader,
    ResourceCards,
    SelectGroup,
    AccountCodeForm
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Object, // Account
      required: false,
      default: undefined
    },
    code: {
      type: String,
      required: true
    },
    payer: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ["update:modelValue", "close-dialog"],
  setup(props, {emit}) {
    const dialog = ref(false)

    const onClick = () => { 
      dialog.value = true
    }

    const value = computed<Account & {member?: Member} | undefined>({
      get() {
        return props.modelValue as Account
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const select = (selectedMember: Member & {account: Account}) => {
      value.value = selectedMember.account
      dialog.value = false
    }

    const store = useStore()
    const myGroup = computed(() => store.getters.myMember?.group)
    
    const group = ref<Group>(props.modelValue?.group ?? myGroup.value)
    
    const searchText = ref('')

    // https://github.com/quasarframework/quasar/issues/8956
    // We don't emit the click from QField component to aviod a Vue warning.
    const fieldRef = ref<QField>();
    onMounted(() => { (fieldRef.value as QField).$el.onclick = onClick });

    const closeDialog = () => {
      // Set value so the validation refreshes cache.
      if (!value.value) {
        value.value = undefined;
      }
      emit("close-dialog");
    }

    const myCurrency = computed(() => store.getters.myAccount.currency)
    const myAccountSettings = computed<AccountSettings>(() => store.getters.myAccount.settings)
    
    const selectGroup = computed(() => {
      if (props.payer) {
        return myAccountSettings.value.attributes.allowExternalPaymentRequests ?? 
        myCurrency.value.attributes.settings.defaultAllowExternalPaymentRequests
      } else {
        return myAccountSettings.value.attributes.allowExternalPayments ?? 
        myCurrency.value.attributes.settings.defaultAllowExternalPayments
      }
    })

    const listGroupMembers = computed(() => {
      return group.value && (group.value.id == myGroup.value.id || group.value.relationships?.members?.links?.related)
    })

    return {
      onClick,
      dialog,
      searchText,
      select,
      fieldRef,
      value,
      closeDialog,
      group,
      selectGroup,
      listGroupMembers
    }
  }
})
</script>
<style lang="scss" scoped>
@media (min-width: $breakpoint-sm-min) {
  .select-member-dialog {
    width: 540px;
    height: 85vh;
  }
}
.searchbar {
  width: 100%;
}
</style>