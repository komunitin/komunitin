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
        v-if="modelValue"
        :member="modelValue"
        clickable
      />
      <div
        v-else 
        tabindex="0" 
        @keydown.enter="onClick"
      />
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
      <q-card-section class="q-pa-none">
        <select-group
          v-model="group"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="members-list q-pa-none">
        <resource-cards
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import MemberHeader from "./MemberHeader.vue"
import SelectGroup from "./SelectGroup.vue"
import ResourceCards from "../pages/ResourceCards.vue"
import { Group, Member } from 'src/store/model';
import { QField } from 'quasar';
import { useStore } from 'vuex';

export default defineComponent({
  components: {
    MemberHeader,
    ResourceCards,
    SelectGroup
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Object,
      required: false,
      default: undefined
    },
    code: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue", "close-dialog"],
  setup(props, {emit}) {
    const dialog = ref(false)

    const onClick = () => { 
      dialog.value = true
    }

    const value = computed<Member & {group: Group} | undefined>({
      get() {
        return props.modelValue as Member & {group: Group}
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const select = (selectedMember: Member & {group: Group}) => {
      value.value = selectedMember
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
    return {
      onClick,
      dialog,
      searchText,
      select,
      fieldRef,
      value,
      closeDialog,
      group
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